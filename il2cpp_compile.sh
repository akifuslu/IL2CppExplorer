#!/bin/sh

echo $UNITY_DIR
echo $ARCHITECTURE
echo $CONFIGURATION

$UNITY_DIR/Unity.app/Contents/il2cpp/build/deploy/il2cpp \
  --convert-to-cpp \
  --emit-null-checks \
  --enable-array-bounds-check \
  --dotnetprofile="unityaot-linux" \
  --platform="Android" \
  --architecture=$ARCHITECTURE \
  --configuration=$CONFIGURATION \
  --assembly=$UNITY_DIR/Unity.app/Contents/MonoBleedingEdge/lib/mono/unityaot-linux/mscorlib.dll \
  --assembly=Hello.dll \
  --generatedcppdir=./out


# adjust the toolchain prefix and API level as needed (here we use API 23)
#NDK="/Applications/Unity/Hub/Editor/6000.0.39f1/PlaybackEngines/AndroidPlayer/NDK"
#CLANG="$NDK/toolchains/llvm/prebuilt/darwin-x86_64/bin/aarch64-linux-android23-clang++"

#$CLANG -S -O2 -fPIC -I ./out ./out/Hello.cpp -o out_cpp/Hello.s \
#-I "/Applications/Unity/Hub/Editor/6000.0.39f1/Unity.app/Contents/il2cpp/libil2cpp/pch" \
#-I "/Applications/Unity/Hub/Editor/6000.0.39f1/Unity.app/Contents/il2cpp/libil2cpp" \
#-I /Applications/Unity/Hub/Editor/6000.0.39f1/Unity.app/Contents/il2cpp/external/baselib/Include \
#-I /Applications/Unity/Hub/Editor/6000.0.39f1/Unity.app/Contents/il2cpp/external/baselib/Platforms/Android/Include