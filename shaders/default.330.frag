#version 330
#extension all : warn

////////////////////////////////////////////////////////////////////////////////

#ifndef HEIGHT_MAP
# define HEIGHT_MAP 1
#endif

#ifndef NORMAL_MAP
# define NORMAL_MAP 1
#endif

#ifndef FRESNEL
# define FRESNEL    1
#endif

#ifndef FOG_TYPE
# define FOG_TYPE   FOG_EXP2
#endif

#ifndef HDR
# define HDR        0
#endif

#ifndef GAMMA
# define GAMMA      1
#endif

#ifndef BLOOM
# define BLOOM      0
#endif

////////////////////////////////////////////////////////////////////////////////

#define FOG_NONE    0
#define FOG_LINEAR  1
#define FOG_EXP     2
#define FOG_EXP2    3

#ifndef FOG_FUNC
# if FOG_TYPE == FOG_EXP2
#  define FOG_FUNC(Z,D,N,F) (1.0 - exp(-pow((D)*max(0.0, (Z) - (N)), 2.0)))
# elif FOG_TYPE == FOG_EXP
#  define FOG_FUNC(Z,D,N,F) (1.0 - exp(-(D)*max(0.0, (Z) - (N))))
# elif FOG_TYPE == FOG_LINEAR
#  define FOG_FUNC(Z,D,N,F) (((Z) - (N)) / ((F) - (N)))
# else
#  define FOG_FUNC(Z,D,N,F) (0.0)
# endif
#endif

////////////////////////////////////////////////////////////////////////////////

precision mediump float;

uniform float uTime = 0.0;
uniform vec2 uResolution = vec2(1);

const int cNumLights = 4;

struct Light {
    vec4 ambtColor;
    vec4 diffColor;
    vec4 specColor;
    vec4 position;
    vec3 halfVector;
    vec3 spotDirection;
    float spotExponent;
    float spotConeInner;
    float spotConeOuter;
    float spotConeInnerCos;
    float spotConeOuterCos;
    vec3 attenuation;
};

uniform Light[cNumLights] uLights;

struct Material {
    sampler2D diffMap;
    sampler2D specMap;
    sampler2D glowMap;
    sampler2D bumpMap;
    float specPower;
    float bumpScale;
    float bumpBias;
    float fresnelPower;
    float fresnelScale;
    float fresnelBias;
};

uniform mat4 uViewMatrix;
uniform mat4 uNormMatrix;

uniform Material uMaterial;

uniform float uGlowFactor = 1.0;

uniform vec4 uFogColor = vec4(vec3(0.0), 1.0);
uniform float uFogDensity = 0.05;
uniform vec2 uFogRange = vec2(5.0, 50.0);

uniform float uExposure = 1.0;
uniform float uGamma = 2.2;

uniform float uBloomThreshold = 0.5;

in vec3 vVertex;
in vec3 vNormal;
in vec2 vTexCoord;

out vec4 fColor;
out vec4 fBloom;

////////////////////////////////////////////////////////////////////////////////
// source: http://www.thetenthplanet.de/archives/1180
////////////////////////////////////////////////////////////////////////////////

mat3 cotangent_frame( vec3 N, vec3 p, vec2 uv )
{
    // get edge vectors of the pixel triangle
    vec3 dp1 = dFdx( p );
    vec3 dp2 = dFdy( p );
    vec2 duv1 = dFdx( uv );
    vec2 duv2 = dFdy( uv );

    // solve the linear system
    vec3 dp2perp = cross( dp2, N );
    vec3 dp1perp = cross( N, dp1 );
    vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;
    vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;

    // construct a scale-invariant frame
    float invmax = inversesqrt( max( dot(T,T), dot(B,B) ) );
    return mat3( T * invmax, B * invmax, N );
}

////////////////////////////////////////////////////////////////////////////////

float intensity(vec3 color) {
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

////////////////////////////////////////////////////////////////////////////////

void main () {
    vec3 normal = normalize(vNormal);
    vec3 eyeDir = normalize(-vVertex);

    vec2 texCoord = vTexCoord;

#if HEIGHT_MAP || NORMAL_MAP
    mat3 TBN = cotangent_frame( normal, -eyeDir, texCoord );
# if HEIGHT_MAP
    float height = texture2D(uMaterial.bumpMap, texCoord).w;
    float scale = uMaterial.bumpScale * height - uMaterial.bumpBias;
    texCoord += scale * normalize(TBN * eyeDir).xy;
# endif
# if NORMAL_MAP
    vec3 bumpNormal = texture2D(uMaterial.bumpMap, texCoord).xyz * 2 - 1;
    normal = normalize(TBN * bumpNormal);
# endif
#endif

    vec4 diffTexCol = texture2D(uMaterial.diffMap, texCoord);
    vec4 specTexCol = texture2D(uMaterial.specMap, texCoord);
    vec4 glowTexCol = texture2D(uMaterial.glowMap, texCoord);
    //~ vec4 diffTexCol = vec4(1,0,0,1);
    //~ vec4 specTexCol = vec4(0,1,0,1);
    //~ vec4 glowTexCol = vec4(0,0,1,1);

    vec3 ambtColor, diffColor, specColor;

    vec3 debugOutput;

    //~ debugOutput.rgb = normal * 0.5 + 0.5;

    vec3 finalLightDir, finalHalfVec;
    float finalLightDist;

    for (int i = 0; i < 2; i++) {

        vec3 lightPos = (uViewMatrix * uLights[i].position).xyz;

        vec3 lightDir = normalize(lightPos - vVertex);
        vec3 halfVec = normalize(eyeDir + lightDir);

        float diffFactor = max(0, dot(normal, lightDir));
        float specFactor = max(0, dot(normal, halfVec));
        specFactor = pow(specFactor, uMaterial.specPower);

        finalLightDir += lightDir;
        finalHalfVec += halfVec;

#if FRESNEL
        float fresnelFactor = uMaterial.fresnelBias + uMaterial.fresnelScale *
            pow(1.0 - dot(eyeDir, halfVec), uMaterial.fresnelPower);
        //~ diffLight *= (1.0f - fresnelFactor);
        //~ specLight *= (0.0f + fresnelFactor);
        specFactor = max(specFactor, fresnelFactor);
#endif

        vec3 ambtLight = uLights[i].ambtColor.rgb;
        vec3 diffLight = uLights[i].diffColor.rgb * diffFactor;
        vec3 specLight = uLights[i].specColor.rgb * specFactor;

        vec3 spotDir = normalize(mat3(uNormMatrix) * uLights[i].spotDirection);

        float cosSpotAngle = dot(spotDir, -lightDir);
        float spotFactor = pow(cosSpotAngle, uLights[i].spotExponent);
        //~ float spotFactor = cosSpotAngle;

        debugOutput.rgb = vec3(max(debugOutput.r, spotFactor));
        //~ debugOutput.rgb = 0.5 + 0.5 * lightDir;

        //~ spotFactor = smoothstep(
            //~ uLights[i].spotConeOuterCos, uLights[i].spotConeInnerCos,
            //~ step(uLights[i].spotConeOuterCos, cosSpotAngle) * spotFactor);

        spotFactor = step(uLights[i].spotConeOuterCos, cosSpotAngle);

        diffLight *= spotFactor;
        specLight *= spotFactor;

        float lightDist = distance(lightPos, vVertex);
        float attenuate = 1.0 /
             (uLights[i].attenuation.x
            + uLights[i].attenuation.y * lightDist
            + uLights[i].attenuation.z * lightDist * lightDist);

        finalLightDist = min(finalLightDist, lightDist);

        ambtLight *= attenuate;
        diffLight *= attenuate;
        specLight *= attenuate;

        ambtColor += ambtLight;
        diffColor += diffLight;
        specColor += specLight;
    }

    vec2 normCoord = gl_FragCoord.xy / uResolution.xy;

    fColor = vec4(vec3(0), diffTexCol.a);
    fColor.rgb += ambtColor * diffTexCol.rgb * glowTexCol.a;
    if (normCoord.x >= 0.25)
    fColor.rgb += diffColor * diffTexCol.rgb;
    if (normCoord.x >= 0.50)
    fColor.rgb += specColor * specTexCol.rgb * specTexCol.a;
    if (normCoord.x >= 0.75)
    fColor.rgb += glowTexCol.rgb * uGlowFactor;

#ifdef FOG_FUNC
    float fogFactor = FOG_FUNC(length(vVertex), uFogDensity, uFogRange.x, uFogRange.y);
    fColor.rgb = mix(fColor.rgb, uFogColor.rgb, clamp(fogFactor, 0.0, 1.0));
#endif

#if HDR
    fColor.rgb = vec3(1.0) - exp(-fColor.rgb * uExposure);
#endif

#if GAMMA
    fColor.rgb = pow(fColor.rgb, vec3(1.0/uGamma));
#endif

#if BLOOM
    fBloom.rgb = step(uBloomThreshold, intensity(fColor.rgb)) * fColor.rgb;
#endif

    //~ fColor.rgb = debugOutput;
}
