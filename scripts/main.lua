light = Light {
    position = { 0, 5, 0 };
    ambientColor = { 0.1, 0.1, 0.1 };
    diffuseColor = { 0.9, 0.8, 0.5 };
    specularColor = { 1.0, 1.0, 1.0 };

    spotDirection = { 0, -1, 0 };
    spotConeInner = 25;
    spotConeOuter = 30;
    spotExponent = 5;
};

light2 = Light {
    position = { 0, 0, 0 };
    ambientColor = { 0.2, 0.2, 0.2 };
    diffuseColor = { 0.2, 0.2, 0.2 };
    specularColor = { 0, 0, 0 };

    spotDirection = { 0, 0, 0 };

    attenuation = { 1, 0.1, 0.01 };
};

room = Object {
    model = {
        primitive = "triangles";
        shape = "box";
        size = { -50, -2.5, -50 };
        center = { 0, 2.5, 0 };
        texRect = { 0, 0, 100, 100 };
    };
    material = {
        diffMap = "data/textures/wall_albedo.png";
        specMap = "data/textures/wall_specular.png";
        glowMap = "data/textures/wall_glow.png";
        bumpMap = "data/textures/wall_normal.png";
        specPower = 100.0;
        bumpScale = 0.02;
        bumpBias = 0.00;
        fresnelPower = 5.0;
        fresnelScale = 1.0;
        fresnelBias = 0.0;
    };
    shader = "data/shaders/default.330";
};

ball = Object {
    model = {
        primitive = "triangles";
        shape = "sphere";
        radius = 0.5;
        steps = { 8, 16 };
        center = { 1, 0.5, 0 };
    };
    material = {
        diffMap = "data/textures/white.png";
        specMap = "data/textures/white.png";
        glowMap = "data/textures/black.png";
        bumpMap = "data/textures/flat.png";
        specPower = 100.0;
        bumpScale = 0.00;
        bumpBias = 0.00;
        fresnelPower = 5.0;
        fresnelScale = 1.0;
        fresnelBias = 0.0;
    };
    shader = "data/shaders/default.330";
};

cube = Object {
    model = {
        primitive = "triangles";
        shape = "box";
        size = { 0.5, 0.5, 0.5 };
        center = { -1, 0.5, 0 };
    };
    material = {
        diffMap = "data/textures/cube_albedo.png";
        specMap = "data/textures/cube_specular.png";
        glowMap = "data/textures/cube_glow.png";
        bumpMap = "data/textures/cube_normal.png";
        specPower = 1000.0;
        bumpScale = 0.05;
        bumpBias = -0.02;
        fresnelPower = 5.0;
        fresnelScale = 1.0;
        fresnelBias = 0.0;
    };
    shader = "data/shaders/default.330";
};

