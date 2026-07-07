import 'package:flutter/material.dart';
import 'generated/jazer_theme.dart';

void main() => runApp(const JazerApp());

enum JazerButtonVariant { primary, secondary, ghost }

class JazerApp extends StatefulWidget {
  const JazerApp({super.key});

  @override
  State<JazerApp> createState() => _JazerAppState();
}

class _JazerAppState extends State<JazerApp> {
  bool _dark = true;

  JazerTheme get _theme => _dark ? JazerTheme.dark : JazerTheme.light;

  @override
  Widget build(BuildContext context) {
    final t = _theme;
    return MaterialApp(
      title: 'JaZeR Flutter',
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        backgroundColor: t.bg,
        appBar: AppBar(
          backgroundColor: t.surface,
          foregroundColor: t.text,
          title: const Text('JaZeR · Flutter'),
          actions: [
            IconButton(
              icon: Icon(_dark ? Icons.light_mode : Icons.dark_mode),
              onPressed: () => setState(() => _dark = !_dark),
            ),
          ],
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(JazerSpace.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Button',
                style: TextStyle(color: t.text, fontSize: 28, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: JazerSpace.md),
              Wrap(
                spacing: JazerSpace.sm,
                runSpacing: JazerSpace.sm,
                children: [
                  JazerButton(label: 'Primary', theme: t, variant: JazerButtonVariant.primary),
                  JazerButton(label: 'Secondary', theme: t, variant: JazerButtonVariant.secondary),
                  JazerButton(label: 'Ghost', theme: t, variant: JazerButtonVariant.ghost),
                ],
              ),
              const SizedBox(height: JazerSpace.xl),
              Text(
                'Card',
                style: TextStyle(color: t.text, fontSize: 28, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: JazerSpace.md),
              JazerCard(
                title: 'Cyberpunk surface',
                body: 'One token source themes this card — same brand as web and SwiftUI.',
                theme: t,
                elevated: true,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// A button styled entirely from the generated JaZeR tokens — the same brand as web.
class JazerButton extends StatelessWidget {
  const JazerButton({
    super.key,
    required this.label,
    required this.theme,
    this.variant = JazerButtonVariant.primary,
    this.onPressed,
  });

  final String label;
  final JazerTheme theme;
  final JazerButtonVariant variant;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final (Color bg, Color fg, Color border) = switch (variant) {
      JazerButtonVariant.primary => (JazerColors.cyan, theme.onAccent, Colors.transparent),
      JazerButtonVariant.secondary => (Colors.transparent, theme.accent, theme.accent),
      JazerButtonVariant.ghost => (Colors.transparent, theme.text, Colors.transparent),
    };

    return Material(
      color: bg,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(JazerRadius.md),
        side: BorderSide(color: border),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(JazerRadius.md),
        onTap: onPressed ?? () {},
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: JazerSpace.lg, vertical: JazerSpace.sm),
          child: Text(label, style: TextStyle(color: fg, fontWeight: FontWeight.w700)),
        ),
      ),
    );
  }
}

/// A card styled from the generated JaZeR tokens — surface, border, and radius from the theme.
class JazerCard extends StatelessWidget {
  const JazerCard({
    super.key,
    required this.title,
    required this.body,
    required this.theme,
    this.elevated = false,
  });

  final String title;
  final String body;
  final JazerTheme theme;
  final bool elevated;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(JazerSpace.lg),
      decoration: BoxDecoration(
        color: theme.surface,
        border: Border.all(color: theme.border),
        borderRadius: BorderRadius.circular(JazerRadius.lg),
        boxShadow: elevated
            ? const [BoxShadow(color: Color(0x40000000), blurRadius: 25, offset: Offset(0, 10))]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(color: theme.text, fontSize: 20, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: JazerSpace.xs),
          Text(body, style: TextStyle(color: theme.textMuted, height: 1.5)),
        ],
      ),
    );
  }
}
