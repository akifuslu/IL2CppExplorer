#!/usr/bin/env bash
set -e
set -x

mkdir -p workDir/out
mkdir -p workDir/out_asm

UNITY_DIR="/Applications/Unity/Hub/Editor/6000.0.39f1"

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
  --architecture=ARM64 \
  --generatedcppdir=workDir/out \
  "${ASS[@]}" \
	--assembly="$Managed"/UnityEngine.dll \
	--assembly="$Managed"/UnityEngine.CoreModule.dll \
	--assembly="$Managed"/UnityEngine.DSPGraphModule.dll \
	--assembly="$Managed"/UnityEngine.AudioModule.dll \
	--assembly="$Managed"/UnityEngine.UnityCurlModule.dll \
	--assembly="$Managed"/UnityEngine.HierarchyCoreModule.dll \
	--assembly="$Managed"/UnityEngine.ContentLoadModule.dll \
	--assembly="$Managed"/UnityEngine.PropertiesModule.dll \
	--assembly="$Managed"/UnityEngine.TLSModule.dll \
	--assembly="$Managed"/UnityEngine.UnityAnalyticsCommonModule.dll \
	--assembly="$Managed"/UnityEngine.AndroidJNIModule.dll \
	--assembly="$Managed"/UnityEngine.MarshallingModule.dll \
	--assembly="$Managed"/UnityEngine.InputLegacyModule.dll \
	--assembly="$Managed"/UnityEngine.AccessibilityModule.dll \
	--assembly="$Managed"/UnityEngine.UIModule.dll \
	--assembly="$Managed"/UnityEngine.UnityConnectModule.dll \
	--assembly="$Managed"/UnityEngine.AIModule.dll \
	--assembly="$Managed"/UnityEngine.AMDModule.dll \
	--assembly="$Managed"/UnityEngine.UnityAnalyticsModule.dll \
	--assembly="$Managed"/UnityEngine.PerformanceReportingModule.dll \
	--assembly="$Managed"/UnityEngine.Physics2DModule.dll \
	--assembly="$Managed"/UnityEngine.AnimationModule.dll \
	--assembly="$Managed"/UnityEngine.PhysicsModule.dll \
	--assembly="$Managed"/UnityEngine.AssetBundleModule.dll \
	--assembly="$Managed"/UnityEngine.SharedInternalsModule.dll \
	--assembly="$Managed"/UnityEngine.TextRenderingModule.dll \
	--assembly="$Managed"/UnityEngine.ClothModule.dll \
	--assembly="$Managed"/UnityEngine.ClusterInputModule.dll \
	--assembly="$Managed"/UnityEngine.ClusterRendererModule.dll \
	--assembly="$Managed"/UnityEngine.CrashReportingModule.dll \
	--assembly="$Managed"/UnityEngine.TilemapModule.dll \
	--assembly="$Managed"/UnityEngine.TerrainModule.dll \
	--assembly="$Managed"/UnityEngine.IMGUIModule.dll \
	--assembly="$Managed"/UnityEngine.VFXModule.dll \
	--assembly="$Managed"/UnityEngine.VideoModule.dll \
	--assembly="$Managed"/UnityEngine.VRModule.dll \
	--assembly="$Managed"/UnityEngine.GridModule.dll \
	--assembly="$Managed"/UnityEngine.ImageConversionModule.dll \
	--assembly="$Managed"/UnityEngine.InputForUIModule.dll \
	--assembly="$Managed"/UnityEngine.SubsystemsModule.dll \
	--assembly="$Managed"/UnityEngine.JSONSerializeModule.dll \
	--assembly="$Managed"/UnityEngine.LocalizationModule.dll \
	--assembly="$Managed"/UnityEngine.MultiplayerModule.dll \
	--assembly="$Managed"/UnityEngine.UnityWebRequestModule.dll \
	--assembly="$Managed"/UnityEngine.UnityWebRequestTextureModule.dll \
	--assembly="$Managed"/UnityEngine.UnityWebRequestAssetBundleModule.dll \
	--assembly="$Managed"/UnityEngine.UnityWebRequestAudioModule.dll \
	--assembly="$Managed"/UnityEngine.UnityWebRequestWWWModule.dll \
	--assembly="$Managed"/UnityEngine.NVIDIAModule.dll \
	--assembly="$Managed"/UnityEngine.ParticleSystemModule.dll \
	--assembly="$Managed"/UnityEngine.DirectorModule.dll \
	--assembly="$Managed"/UnityEngine.VirtualTexturingModule.dll \
	--assembly="$Managed"/UnityEngine.ScreenCaptureModule.dll \
	--assembly="$Managed"/UnityEngine.GameCenterModule.dll \
	--assembly="$Managed"/UnityEngine.SpriteMaskModule.dll \
	--assembly="$Managed"/UnityEngine.StreamingModule.dll \
	--assembly="$Managed"/UnityEngine.TerrainPhysicsModule.dll \
	--assembly="$Managed"/UnityEngine.TextCoreFontEngineModule.dll \
	--assembly="$Managed"/UnityEngine.TextCoreTextEngineModule.dll \
	--assembly="$Managed"/UnityEngine.SpriteShapeModule.dll \
	--assembly="$Managed"/UnityEngine.UIElementsModule.dll \
	--assembly="$Managed"/UnityEngine.VehiclesModule.dll \
	--assembly="$Managed"/UnityEngine.WindModule.dll \
	--assembly="$Managed"/UnityEngine.XRModule.dll \
	--assembly="$Managed"/UnityEngine.ARModule.dll \
	--assembly="$Managed"/UnityEngine.InputModule.dll \
  --assembly=workDir/UserCode.dll \

echo "Done! C++ lives in ./cpp-out"

NDK="$UNITY_DIR/PlaybackEngines/AndroidPlayer/NDK"
CLANG="$NDK/toolchains/llvm/prebuilt/darwin-x86_64/bin/aarch64-linux-android23-clang++"

$CLANG ./workDir/out/UserCode.cpp \
-I ./workDir/out \
-o ./workDir/out_asm/UserCode.o \
-I $UNITY_DIR/Unity.app/Contents/il2cpp/libil2cpp/pch \
-I $UNITY_DIR/Unity.app/Contents/il2cpp/libil2cpp \
-I $UNITY_DIR/Unity.app/Contents/il2cpp/external/baselib/Include \
-I $UNITY_DIR/Unity.app/Contents/il2cpp/external/baselib/Platforms/Android/Include \
-march=armv8-a  \
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
-Os \
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
-target aarch64-linux-android23 \
-mllvm \
--dse-memoryssa-defs-per-block-limit=0 \
-fstrict-aliasing \
-fdiagnostics-format=msvc \
-g \
-c 

objdump -d --source workDir/out_asm/UserCode.o > workDir/out_asm/UserCode.s

echo "Done! Compiled cpp"

