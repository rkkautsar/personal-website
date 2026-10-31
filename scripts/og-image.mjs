import { readFile } from 'node:fs/promises';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import sharp from 'sharp';

const font = (name) =>
  readFile(new URL(`../public/fonts/${name}`, import.meta.url));

// Satori ignores variable-font weight axes, so Inter is only used at its
// default weight and the headline uses the static XCharter bold cut.
const [inter, xcharterBold] = await Promise.all([
  font('inter-latin.woff2'),
  font('xcharter-Bold.woff2'),
]);

const fonts = [
  { name: 'Inter', data: inter, weight: 400, style: 'normal' },
  { name: 'XCharter', data: xcharterBold, weight: 700, style: 'normal' },
];

const palette = {
  background: '#1e2019',
  brightSnow: '#fbfaf8',
  bone: '#e7decd',
  muted: '#aaa99e',
  pineText: '#89afb1',
  line: 'rgba(231, 222, 205, 0.14)',
  description: 'rgba(231, 222, 205, 0.74)',
};

const card = {
  width: 1200,
  height: 630,
};

// 1200x630 is the standard Open Graph card size. Bump to 2 for retina output
// if a card needs to stay sharp when a viewer upscales it.
const OG_SCALE = 1;

export const ogImageSize = {
  width: card.width * OG_SCALE,
  height: card.height * OG_SCALE,
};

// Satori resolves percentage widths against the outer box and misplaces
// children under `space-between` with root padding, so the rows are sized
// explicitly instead of relying on `width: '100%'` and flex distribution.
const contentWidth = card.width - 160;
const contentHeight = card.height - 144;
const headerHeight = 34;
const footerHeight = 54;
const middleHeight = contentHeight - headerHeight - footerHeight;

function headlineSize(title) {
  if (title.length > 64) return 54;
  if (title.length > 46) return 62;
  return 72;
}

function formatDate(date) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function template({ title, description, date, minutes }) {
  const meta = [formatDate(date), minutes && `${minutes} min read`]
    .filter(Boolean)
    .join(' · ');

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        width: card.width,
        height: card.height,
        padding: '72px 80px',
        backgroundColor: palette.background,
        backgroundImage: [
          'radial-gradient(circle at 6% 0%, rgba(112, 38, 50, 0.4) 0%, rgba(112, 38, 50, 0) 46%)',
          'radial-gradient(circle at 96% 84%, rgba(88, 123, 127, 0.32) 0%, rgba(88, 123, 127, 0) 50%)',
        ].join(', '),
        color: palette.brightSnow,
        fontFamily: 'Inter',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              width: contentWidth,
              height: headerHeight,
            },
            children: [
              {
                type: 'span',
                props: {
                  style: {
                    fontSize: 26,
                    letterSpacing: '-0.02em',
                    color: palette.brightSnow,
                  },
                  children: 'rakha.dev',
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    fontSize: 18,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: palette.pineText,
                  },
                  children: 'Writing',
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              width: contentWidth,
              height: middleHeight,
              justifyContent: 'center',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'XCharter',
                    fontWeight: 700,
                    fontSize: headlineSize(title),
                    lineHeight: 1.1,
                    letterSpacing: '-0.025em',
                    color: palette.brightSnow,
                    lineClamp: 3,
                  },
                  children: title,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    marginTop: 28,
                    fontSize: 29,
                    lineHeight: 1.45,
                    color: palette.description,
                    lineClamp: 2,
                  },
                  children: description,
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              width: contentWidth,
              height: footerHeight,
              alignItems: 'flex-end',
              paddingTop: 22,
              borderTop: `1px solid ${palette.line}`,
              fontSize: 22,
              color: palette.muted,
            },
            children: [
              { type: 'span', props: { children: meta } },
              {
                type: 'span',
                props: {
                  style: { color: palette.bone },
                  children: 'Rakha Kanz Kautsar',
                },
              },
            ],
          },
        },
      ],
    },
  };
}

export async function renderOgImage(post, { scale = OG_SCALE } = {}) {
  const svg = await satori(template(post), { ...card, fonts });
  const rendered = new Resvg(svg, {
    fitTo: { mode: 'width', value: card.width * scale },
  }).render();
  // Resvg emits RGBA PNGs, which carry a mostly constant alpha channel and
  // cost ~40% more bytes. A 256-colour palette round-trips the flat text and
  // smooth gradient without visible banding and keeps edges sharp.
  return sharp(rendered.asPng())
    .png({
      palette: true,
      colours: 256,
      dither: 1,
      compressionLevel: 9,
      effort: 10,
    })
    .toBuffer();
}
