# MinEngine Data

This repository contains resources (fonts, shaders, textures, etc.) for use with
MinEngine.  To use them, clone `minengine-data` into the build directory under
`data`, e.g.:

    git clone https://github.com/criptych/minengine.git minengine
    mkdir minengine/build
    cd minengine/build
    git clone https://github.com/criptych/minengine-data.git data

Now, configure and build MinEngine:

    cmake [-G <generator-name>] ..
    cmake --build .

