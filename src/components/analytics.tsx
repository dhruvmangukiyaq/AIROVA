import Script from "next/script";

/**
 * Analytics placeholders (GA4 + Meta Pixel).
 * Fill the IDs in `.env` — the tags are not rendered until the IDs exist.
 */
export function Analytics() {
  const ga4 = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "";
  const meta = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

  return (
    <>
      {ga4 ? (
        <>
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');`}
          </Script>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`}
            strategy="afterInteractive"
          />
        </>
      ) : null}
      {meta ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${meta}');fbq('track','PageView');`}
        </Script>
      ) : null}
    </>
  );
}
