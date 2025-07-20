#!/bin/sh

/Applications/Unity/Hub/Editor/6000.0.39f1/Unity.app/Contents/MonoBleedingEdge/bin/mcs \
  -target:library \
  -out:./workDir/UserCode.dll \
  ./workDir/UserCode.cs

$UNITY_DIR/Unity.app/Contents/il2cpp/build/deploy/il2cpp \
  --convert-to-cpp \
  --emit-null-checks \
  --enable-array-bounds-check \
  --dotnetprofile="unityaot-linux" \
  --platform="Android" \
  --architecture=$ARCHITECTURE \
  --configuration=$CONFIGURATION \
  --assembly=$UNITY_DIR/Unity.app/Contents/MonoBleedingEdge/lib/mono/unityaot-linux/mscorlib.dll \
  --assembly=./workDir/UserCode.dll \
  --generatedcppdir=./workDir/out


# adjust the toolchain prefix and API level as needed (here we use API 23)
NDK="$UNITY_DIR/PlaybackEngines/AndroidPlayer/NDK"
CLANG="$NDK/toolchains/llvm/prebuilt/darwin-x86_64/bin/aarch64-linux-android23-clang++"

$CLANG -S -O0 -fPIC -I ./workDir/out ./workDir/out/UserCode.cpp -o ./workDir/out_asm/UserCode.s \
-I $UNITY_DIR/Unity.app/Contents/il2cpp/libil2cpp/pch \
-I $UNITY_DIR/Unity.app/Contents/il2cpp/libil2cpp \
-I $UNITY_DIR/Unity.app/Contents/il2cpp/external/baselib/Include \
-I $UNITY_DIR/Unity.app/Contents/il2cpp/external/baselib/Platforms/Android/Include