import React from 'react';

export function AppleLogo({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.72-.93 2.74 1.01.08 2.02-.49 2.64-1.24z" />
    </svg>
  );
}

export function GoogleLogo({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function VisaLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 36 22"
      width={size}
      height={(size * 22) / 36}
      style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: '3px' }}
    >
      <rect width="36" height="22" rx="3" fill="#1A1F71" />
      <text
        x="18"
        y="15.5"
        fill="#FFFFFF"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="10"
        fontWeight="800"
        fontStyle="italic"
        textAnchor="middle"
        letterSpacing="0.8px"
      >
        VISA
      </text>
    </svg>
  );
}

export function MastercardLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 36 22"
      width={size}
      height={(size * 22) / 36}
      style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: '3px' }}
    >
      <rect width="36" height="22" rx="3" fill="#2D2B38" />
      <circle cx="14" cy="11" r="6" fill="#EB001B" />
      <circle cx="22" cy="11" r="6" fill="#F79E1B" fillOpacity="0.9" />
    </svg>
  );
}

export function PayPalLogo({ size = 20 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <path
        fill="#003087"
        d="M20.067 8.478c-.492.88-1.22 1.547-2.185 2.001-.965.454-2.148.681-3.551.681h-1.57l-1.07 6.782h-3.324l2.45-15.52h5.185c1.47 0 2.665.234 3.585.703.92.468 1.493 1.157 1.72 2.066.227.909.146 1.838-.24 2.787z"
      />
      <path
        fill="#0079C1"
        d="M17.42 11.233c-.492.88-1.22 1.547-2.185 2.001-.965.454-2.148.681-3.551.681h-1.57l-1.07 6.782h-3.324l1.39-8.81h3.185c1.47 0 2.665.234 3.585.703.92.468 1.493 1.157 1.72 2.066.227.909.146 1.838-.24 2.787l-.02.04z"
      />
    </svg>
  );
}

export function BrandIconRenderer({
  brand,
  icon,
  size = 22,
}: {
  brand?: string;
  icon?: string;
  size?: number;
}) {
  const b = (brand || '').toLowerCase();
  const ic = (icon || '').toLowerCase();

  if (b.includes('apple') || b.includes('cloudpay') || ic.includes('apple') || ic === '🍎') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size + 6,
          height: size + 6,
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '8px',
          color: '#FFFFFF',
        }}
      >
        <AppleLogo size={size} />
      </span>
    );
  }

  if (b.includes('google') || ic.includes('google') || ic === '🌐') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size + 6,
          height: size + 6,
          background: '#FFFFFF',
          borderRadius: '8px',
          padding: '2px',
        }}
      >
        <GoogleLogo size={size} />
      </span>
    );
  }

  if (b.includes('visa')) {
    return <VisaLogo size={size + 10} />;
  }

  if (b.includes('mastercard')) {
    return <MastercardLogo size={size + 10} />;
  }

  if (b.includes('paypal') || ic.includes('paypal') || ic === '🅿️') {
    return <PayPalLogo size={size + 2} />;
  }

  return <span style={{ fontSize: `${size}px` }}>💳</span>;
}
