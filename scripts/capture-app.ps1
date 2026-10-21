param([string]$AppPath = '../arancel_bob_v2')
$ErrorActionPreference = 'Stop'
$workspace = Split-Path $PSScriptRoot -Parent
$scratch = Join-Path $workspace '.preview-app'
New-Item -ItemType Directory -Force "$scratch/.dart_tool", "$scratch/test" | Out-Null
foreach ($folder in @('lib', 'assets', 'resources')) {
  Copy-Item (Join-Path $AppPath $folder) $scratch -Recurse -Force
}
# Flutter's test runner uses Ahem when a control sets an explicit text style
# without a font. Pin Android's normal Roboto in this temporary copy only.
$calculator = Join-Path $scratch 'lib/pantallas/pantalla_calculadora.dart'
$calculatorSource = Get-Content $calculator -Raw
Set-Content $calculator ($calculatorSource.Replace('TextStyle(', "TextStyle(fontFamily: 'Roboto', ")) -Encoding utf8
Copy-Item "$AppPath/pubspec.yaml", "$AppPath/pubspec.lock" $scratch -Force
Copy-Item "$AppPath/.dart_tool/package_config.json" "$scratch/.dart_tool/" -Force
Copy-Item "$AppPath/.dart_tool/package_graph.json" "$scratch/.dart_tool/" -Force
$source = Get-Content "$AppPath/test/ui_adaptable_test.dart" -Raw
$source = $source.Substring(0, $source.IndexOf('void main() {'))
$source = $source.Replace('buscarConJerarquia(String termino) async => []', 'buscarConJerarquia(String termino) async => [_partida]')
$source = $source.Replace('obtenerFavoritos() async => []', 'obtenerFavoritos() async => [_partida]')
$source = $source.Replace('theme: ControladorTema.instancia.tema,', "theme: ControladorTema.instancia.tema.copyWith(textTheme: ControladorTema.instancia.tema.textTheme.apply(fontFamily: 'Roboto')),")
$source += @'
void main() {
  setUpAll(() async {
    final raiz = Platform.environment['FLUTTER_ROOT'] ?? 'C:/flutter';
    for (final entrada in [
      ('Roboto', 'roboto-regular.ttf'),
      ('MaterialIcons', 'materialicons-regular.otf'),
    ]) {
      final archivo = File('$raiz/bin/cache/artifacts/material_fonts/${entrada.$2}');
      final loader = FontLoader(entrada.$1)
        ..addFont(Future.value(ByteData.sublistView(archivo.readAsBytesSync())));
      await loader.load();
    }
  });
  setUp(() async {
    SharedPreferences.setMockInitialValues({
      'tipo_cambio_bcb': 6.96, 'tipo_cambio_oficial': 6.96,
    });
    PackageInfo.setMockInitialValues(appName: 'Arancel Bolivia', packageName: 'com.example.arancel_bob_unoficial', version: '0.3.3', buildNumber: '25', buildSignature: '');
    await ControladorTema.instancia.cambiarSemilla(const Color(0xFF129B8B));
  });
  for (final item in [('inicio', 2), ('busqueda', 1), ('calculadora', 3), ('favoritos', 0), ('temas', 4), ('inicio-oscuro', 2)]) {
    testWidgets('Captura ${item.$1}', (tester) async {
      final repo = _Repositorio();
      await _montar(tester, PantallaPrincipal(indiceInicial: item.$2), repo, oscuro: item.$1 == 'inicio-oscuro');
      if (item.$1 == 'busqueda') {
        await tester.enterText(find.byType(TextField).first, 'Mostaza');
        await tester.pump(const Duration(milliseconds: 600));
        FocusManager.instance.primaryFocus?.unfocus();
        await tester.pumpAndSettle();
      }
      await _capturar(tester, item.$1);
      expect(tester.takeException(), isNull);
    });
  }
}
'@
Set-Content "$scratch/test/capture_web_test.dart" $source -Encoding utf8
Push-Location $scratch
try {
  flutter test --no-pub --dart-define=CAPTURAR_UI=true test/capture_web_test.dart
  if ($LASTEXITCODE -ne 0) { throw 'Falló la captura Flutter.' }
} finally { Pop-Location }
$destination = Join-Path $workspace 'public/capturas/actual'
New-Item -ItemType Directory -Force $destination | Out-Null
Copy-Item "$scratch/build/ui-preview/*.png" $destination -Force
