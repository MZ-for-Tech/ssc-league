# UI sizing standard

Use the shared sizing tokens and component classes in `app/globals.css` for page layout and repeated UI primitives. Avoid choosing a new mobile padding or heading size for each screen when one of these shared roles applies.

## Responsive scale

| Token | Phone, under 640px | Small screens, 640–767px | 768px and wider |
| --- | ---: | ---: | ---: |
| Page gutter | 16px | 24px | 32px |
| Page block padding | 16px | 24px | 32px |
| Page stack gap | 16px | 20px | 24px |
| Panel padding | 16px | 20px | 24px |
| Page title | 24px | 30px | 36px |
| Section title | 18px | 20px | 24px |
| Touch target minimum height | 44px | 44px | 44px |

## Shared classes

- `.app-content` applies the page gutter and block padding.
- `.app-page-stack` provides a vertical page layout with the shared section gap.
- `.app-panel-padding` applies panel padding.
- `.app-page-title` and `.app-section-title` set the two shared heading levels.
- `.app-touch-target` sets the minimum height for interactive targets.
- `.app-mobile-header`, `.app-brand-symbol`, and `.app-brand-title` size the shared mobile header and brand.

On phone widths, controls using `.console-control` also receive the 44px minimum. For other buttons, links, or fields, add `.app-touch-target` when the control needs the standard touch target. Keep icon-only actions at this size even when the icon itself is small.

Add a new token only when a repeated UI role cannot be expressed by these existing values. Keep page-specific visual exceptions local, and document why they need a different size.
