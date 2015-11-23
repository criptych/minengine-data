light = Light {
    position = { 0, 5, 0 };
    ambientColor = { 0.1, 0.1, 0.1 };
    diffuseColor = { 0.9, 0.8, 0.5 };
    specularColor = { 1.0, 1.0, 1.0 };

    spotDirection = { 0, -1, 0 };
    spotConeInner = 60;
    spotConeOuter = 90;
};

light2 = Light {
    position = { -3, 2, 3 };
    ambientColor = { 0, 0, 0 };
    diffuseColor = { 1, 0, 0 };
    specularColor = { 5, 0, 0 };
    attenuation = { 1, 0.1, 0.01 };
    spotConeInner = 30;
    spotConeOuter = 40;
    spotDirection = { 0, -1, 0 };
};

light2_ball = Object {
    model = {
        primitive = "triangles";
        shape = "sphere";
        radius = 0.1;
        steps = 8;
        center = { -3, 2, 3 };
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

light3 = Light {
    position = { 0, 2, 3 };
    ambientColor = { 0, 0, 0 };
    diffuseColor = { 1, 1, 0 };
    specularColor = { 5, 5, 0 };
    attenuation = { 1, 0.1, 0.01 };
    spotConeInner = 30;
    spotConeOuter = 40;
    spotDirection = { 0, -1, 0 };
};

light3_ball = Object {
    model = {
        primitive = "triangles";
        shape = "sphere";
        radius = 0.1;
        steps = 8;
        center = { 0, 2, 3 };
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

light4 = Light {
    position = { 3, 2, 3 };
    ambientColor = { 0.0, 0.0, 0.0 };
    diffuseColor = { 0, 1, 0 };
    specularColor = { 0, 5, 0 };
    attenuation = { 1, 0.1, 0.01 };
    spotConeInner = 30;
    spotConeOuter = 40;
    spotDirection = { 0, -1, 0 };
};

light4_ball = Object {
    model = {
        primitive = "triangles";
        shape = "sphere";
        radius = 0.1;
        steps = 8;
        center = { 3, 2, 3 };
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
        bumpScale = 0.02;
        bumpBias = 0.01;
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
        specPower = 200.0;
        bumpScale = 0.05;
        bumpBias = -0.02;
        fresnelPower = 5.0;
        fresnelScale = 1.0;
        fresnelBias = 0.0;
    };
    shader = "data/shaders/default.330";
};

