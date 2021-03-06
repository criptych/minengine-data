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

const float Pi = 3.14159265358;

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
    vec3 ambtColor, diffColor, specColor;

    float R2 = 1.0 / (uMaterial.specPower * uMaterial.specPower);

    float NdotV = dot(normal, eyeDir);

    for (int i = 0; i < cNumLights; i++) {

        vec3 lightPos = uLights[i].position.xyz;

        vec3 lightDir = normalize(lightPos - vVertex);
        vec3 halfVec = normalize(eyeDir + lightDir);

        float NdotL = dot(normal, lightDir);
        float NdotH = dot(normal, halfVec);
        float VdotH = dot(eyeDir, halfVec);

        float G0 = 2.0 * NdotH / VdotH;
        float Gb = G0 * NdotV;
        float Gc = G0 * NdotL;
        float G = min(1.0, min(Gb, Gc));

        float NH2 = NdotH * NdotH;
        float D = exp((NH2 - 1.0) / (R2 * NH2)) / (Pi * R2 * NH2 * NH2);

        float F = uMaterial.fresnelBias + uMaterial.fresnelScale *
            pow((1.0 - VdotH), uMaterial.fresnelPower);

        float diffFactor = NdotL;
        float specFactor = G * D * F / (Pi * NdotL * NdotV);

        vec3 ambtLight = uLights[i].ambtColor.rgb;
        vec3 diffLight = uLights[i].diffColor.rgb * diffFactor;
        vec3 specLight = uLights[i].specColor.rgb * specFactor;

        vec3 spotDir = normalize(mat3(uNormMatrix) * uLights[i].spotDirection);

        float cosSpotAngle = dot(spotDir, -lightDir);
        float spotFactor = (cosSpotAngle - uLights[i].spotConeOuterCos) /
            (uLights[i].spotConeInnerCos - uLights[i].spotConeOuterCos);
        spotFactor = pow(spotFactor, uLights[i].spotExponent);
        spotFactor = clamp(spotFactor, 0.0, 1.0);

        float lightDist = distance(lightPos, vVertex);
        float attenuate = 1.0 /
             (uLights[i].attenuation.x
            + uLights[i].attenuation.y * lightDist
            + uLights[i].attenuation.z * lightDist * lightDist);
        attenuate = clamp(attenuate, 0.0, 1.0);

        ambtLight *= attenuate;
        diffLight *= attenuate * spotFactor;
        specLight *= attenuate * spotFactor;

        ambtColor += ambtLight;
        diffColor += diffLight;
        specColor += specLight;
    }

    fColor = vec4(vec3(0), diffTexCol.a);
    fColor.rgb += ambtColor * diffTexCol.rgb * glowTexCol.a;
    fColor.rgb += diffColor * diffTexCol.rgb;
    fColor.rgb += specColor * specTexCol.rgb * specTexCol.a;
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
}
