import 'package:flutter_test/flutter_test.dart';
import 'package:jazer_showcase/main.dart';
import 'package:jazer_showcase/generated/jazer_theme.dart';

void main() {
  testWidgets('renders the JaZeR button showcase', (tester) async {
    await tester.pumpWidget(const JazerApp());

    expect(find.text('Primary'), findsOneWidget);
    expect(find.text('Secondary'), findsOneWidget);
    expect(find.text('Ghost'), findsOneWidget);
  });

  test('generated tokens carry the brand values', () {
    expect(JazerRadius.md, 12.0);
    expect(JazerSpace.lg, 24.0);
    // dark and light themes are distinct
    expect(JazerTheme.dark.bg == JazerTheme.light.bg, isFalse);
  });
}
