/**
 * Strip framer-motion from dashboard pages.
 * Run: node strip-motion.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE = 'app/(dashboard)';

const FILES = [
  'companies/page.tsx',
  'dashboard/page.tsx',
  'planner/page.tsx',
  'vision-studio/page.tsx',
  'my-plans/page.tsx',
  'my-generations/page.tsx',
  'hashtags/page.tsx',
  'insights/page.tsx',
];

for (const rel of FILES) {
  const filePath = join(BASE, rel);
  let src = readFileSync(filePath, 'utf8');
  const originalMotionCount = (src.match(/motion\./g) || []).length;

  // ──────────────────────────────────────────────
  // 1. Remove animation variant objects (multi-line const blocks)
  // ──────────────────────────────────────────────
  // Remove blocks like: const container: Variants = { ... };
  src = src.replace(/^const\s+\w+:\s*Variants\s*=\s*\{[\s\S]*?\};\s*$/gm, '');
  // Remove floating variant blocks
  src = src.replace(/^const\s+floatingVariant:\s*Variants\s*=\s*\{[\s\S]*?\};\s*$/gm, '');

  // ──────────────────────────────────────────────
  // 2. Remove FloatingParticles component (dashboard)
  // ──────────────────────────────────────────────
  src = src.replace(/\/\*.*Floating sparkle\/particle.*\*\/\s*function FloatingParticles\(\)\s*\{[\s\S]*?^}\s*/m, '');
  // Remove usage of <FloatingParticles />
  src = src.replace(/\s*{\/\*.*[Ff]loating sparkle particles.*\*\/}\s*\n\s*<FloatingParticles\s*\/>/g, '');

  // ──────────────────────────────────────────────
  // 3. Replace <motion.tagName ...props> with <tagName ...cleanedProps>
  //    This is the core transformation.
  // ──────────────────────────────────────────────

  // Helper: remove framer-motion specific props from an element's attribute string
  function stripMotionProps(attrStr) {
    // Remove these props entirely:
    // initial={{ ... }}
    // animate={{ ... }}
    // exit={{ ... }}
    // transition={{ ... }}
    // whileHover={{ ... }}
    // whileTap={{ ... }}
    // whileInView={{ ... }}
    // variants={...}
    // layout
    // layoutId="..."

    const propsToRemove = [
      'initial', 'animate', 'exit', 'transition',
      'whileHover', 'whileTap', 'whileInView', 'whileFocus',
      'variants', 'layout', 'layoutId',
    ];

    for (const prop of propsToRemove) {
      // Match prop={{ ... }} with nested braces
      // e.g. initial={{ opacity: 0, y: 30 }}
      attrStr = attrStr.replace(new RegExp(`\\s+${prop}=\\{\\{[^}]*\\}\\}`, 'g'), '');
      // Match prop={identifier} e.g. variants={container}
      attrStr = attrStr.replace(new RegExp(`\\s+${prop}=\\{[^}]*\\}`, 'g'), '');
      // Match prop="..." e.g. layoutId="sidebar"
      attrStr = attrStr.replace(new RegExp(`\\s+${prop}="[^"]*"`, 'g'), '');
      // Match bare prop (no value) e.g. layout
      attrStr = attrStr.replace(new RegExp(`\\s+${prop}(?=[\\s/>])`, 'g'), '');
    }

    return attrStr;
  }

  // Replace <motion.div ...> with <div ...> (and strip motion props)
  // Use a loop approach since regex can't handle nested braces perfectly

  const tags = ['div', 'span', 'section', 'button', 'label', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

  for (const tag of tags) {
    // Opening tags: <motion.div ... > or <motion.div ... />
    // We need a multi-pass approach for nested {{ }}

    // Self-closing: <motion.div ... />
    const selfClosingRegex = new RegExp(`<motion\\.${tag}([\\s\\S]*?)\\/>`, 'g');
    src = src.replace(selfClosingRegex, (match, attrs) => {
      const cleanAttrs = stripMotionProps(attrs);
      return `<${tag}${cleanAttrs}/>`;
    });

    // Opening tags: <motion.div ...>
    const openRegex = new RegExp(`<motion\\.${tag}([\\s\\S]*?)>`, 'g');
    src = src.replace(openRegex, (match, attrs) => {
      // Don't match closing tags
      if (match.endsWith('/>')) return match;
      const cleanAttrs = stripMotionProps(attrs);
      return `<${tag}${cleanAttrs}>`;
    });

    // Closing tags: </motion.div>
    const closeRegex = new RegExp(`<\\/motion\\.${tag}>`, 'g');
    src = src.replace(closeRegex, `</${tag}>`);
  }

  // ──────────────────────────────────────────────
  // 4. For whileHover={{ y: -N }} patterns that were on cards,
  //    add hover CSS classes (we already stripped the props above,
  //    so we add CSS classes to relevant card containers).
  //    This is handled by the className already having transition classes.
  // ──────────────────────────────────────────────

  // Add hover:-translate-y-1.5 transition-transform to card containers that had whileHover
  // The most common pattern was whileHover={{ y: -6 }} on card wrappers
  // Since we stripped those, we should check if className already has hover or transition.
  // For simplicity, we won't auto-add hover classes - the visual effect loss is acceptable
  // per the rules (replace motion with plain elements).

  // ──────────────────────────────────────────────
  // 5. Clean up imports
  // ──────────────────────────────────────────────

  const hasAnimatePresence = src.includes('<AnimatePresence');
  const hasMotion = /\bmotion\./.test(src);

  if (!hasAnimatePresence && !hasMotion) {
    // Remove entire framer-motion import line
    src = src.replace(/^import\s*\{[^}]*\}\s*from\s*["']framer-motion["'];?\s*\n/gm, '');
    src = src.replace(/^import\s+.*\s+from\s*["']framer-motion["'];?\s*\n/gm, '');
  } else if (hasAnimatePresence && !hasMotion) {
    // Only keep AnimatePresence
    src = src.replace(
      /^import\s*\{[^}]*\}\s*from\s*["']framer-motion["'];?\s*$/gm,
      'import { AnimatePresence } from "framer-motion";'
    );
  }

  // Remove 'type Variants' from import if variants are gone
  if (!src.includes(': Variants')) {
    src = src.replace(/,\s*type\s+Variants/g, '');
    src = src.replace(/type\s+Variants,?\s*/g, '');
  }

  // ──────────────────────────────────────────────
  // 6. Remove now-unused variant references
  // ──────────────────────────────────────────────
  // Remove "variants={container}" etc that may have survived
  src = src.replace(/\s+variants=\{[^}]*\}/g, '');

  // ──────────────────────────────────────────────
  // 7. Clean up empty lines (max 2 consecutive)
  // ──────────────────────────────────────────────
  src = src.replace(/\n{4,}/g, '\n\n\n');

  const newMotionCount = (src.match(/motion\./g) || []).length;

  writeFileSync(filePath, src, 'utf8');
  console.log(`${rel}: ${originalMotionCount} → ${newMotionCount} motion refs`);
}

console.log('\nDone!');
