#!/usr/bin/env bash
set -e

mkdir -p workDir/out
mkdir -p workDir/out_asm


U="$UNITY_DIR/Unity.app/Contents"

REFS=()
for D in "$U"/MonoBleedingEdge/lib/mono/4.8-api/*.dll; do
  REFS+=("-r:$D")
done
REFS=()
for D in "$U"/MonoBleedingEdge/lib/mono/4.8-api/Facades/*.dll; do
  REFS+=("-r:$D")
done
for D in "$U"/Managed/*.dll; do
  REFS+=("-r:$D")
done

ASS=()
for D in "$U"/MonoBleedingEdge/lib/mono/unityaot-linux/*.dll; do
  ASS+=("--assembly=$D")
done
for D in "$U"/MonoBleedingEdge/lib/mono/unityaot-linux/Facades/*.dll; do
  ASS+=("--assembly=$D")
done
for D in "$U"/Managed/*.dll; do
  ASS+=("--assembly=$D")
done



"$U"/MonoBleedingEdge/bin/mcs \
  -target:library \
  -out:workDir/UserCode.dll \
  "${REFS[@]}" \
  workDir/UserCode.cs

Managed="$U"/Managed/UnityEngine

"$U"/il2cpp/build/deploy/il2cpp \
  --convert-to-cpp \
  --emit-null-checks \
  --enable-array-bounds-check \
  --dotnetprofile=unityaot-linux \
  --platform=Android \
  --configuration=$CONFIGURATION\
  --architecture=$ARCHITECTURE \
  --generatedcppdir=workDir/out \
  "${ASS[@]}" \
  --assembly=workDir/UserCode.dll \



Optimization=Os
if [ "$CONFIGURATION" = "Debug" ]; then
	Optimization=O0
fi

NDK="$UNITY_DIR/PlaybackEngines/AndroidPlayer/NDK"
CLANG="$NDK/toolchains/llvm/prebuilt/darwin-x86_64/bin/aarch64-linux-android23-clang++"
if [ "$ARCHITECTURE" = "ARMv7" ]; then
	CLANG="$NDK/toolchains/llvm/prebuilt/darwin-x86_64/bin/armv7a-linux-androideabi23-clang++"
fi


$CLANG ./workDir/out/UserCode.cpp \
-I ./workDir/out \
-o ./workDir/out_asm/UserCode.o \
-I $UNITY_DIR/Unity.app/Contents/il2cpp/libil2cpp/pch \
-I $UNITY_DIR/Unity.app/Contents/il2cpp/libil2cpp \
-I $UNITY_DIR/Unity.app/Contents/il2cpp/external/baselib/Include \
-I $UNITY_DIR/Unity.app/Contents/il2cpp/external/baselib/Platforms/Android/Include \
-D__ANDROID_UNAVAILABLE_SYMBOLS_ARE_WEAK__  \
-faddrsig  \
-DANDROID  \
-DHAVE_INTTYPES_H  \
-no-canonical-prefixes  \
-fomit-frame-pointer  \
-Wswitch  \
-Wno-trigraphs  \
-Wno-tautological-compare  \
-Wno-invalid-offsetof  \
-Wno-implicitly-unsigned-literal \
-Wno-integer-overflow \
-Wno-shift-negative-value \
-Wno-unknown-attributes \
-Wno-implicit-function-declaration \
-Wno-null-conversion \
-Wno-missing-declarations \
-Wno-unused-value \
-Wno-pragma-once-outside-header \
-Wno-unknown-warning-option \
-Wno-undef-prefix \
-fvisibility=hidden \
-fexceptions \
-funwind-tables \
-$Optimization \
-fPIC \
-fno-strict-overflow \
-ffunction-sections \
-fdata-sections \
-fstack-protector \
-fmessage-length=0 \
-pipe \
-DBASELIB_INLINE_NAMESPACE=il2cpp_baselib \
-DIL2CPP_MONO_DEBUGGER_DISABLED \
-DRUNTIME_IL2CPP \
-DTARGET_ARM64 \
-DIL2CPP_ENABLE_WRITE_BARRIERS=1 \
-DIL2CPP_INCREMENTAL_TIME_SLICE=3 \
-DHAVE_BDWGC_GC \
-fcolor-diagnostics \
-mllvm \
--dse-memoryssa-defs-per-block-limit=0 \
-fstrict-aliasing \
-fdiagnostics-format=msvc \
-g \
-c 

objdump -d --source workDir/out_asm/UserCode.o > workDir/out_asm/UserCode.s

