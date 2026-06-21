import { ImageResponse } from 'next/og';

export const size = {
    width: 180,
    height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f5efe3',
                }}
            >
                <svg
                    width="150"
                    height="150"
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <polygon points="50,4 58.282,19.09 73,10.163 72.627,27.373 89.837,27 80.91,41.718 96,50 80.91,58.282 89.837,73 72.627,72.627 73,89.837 58.282,80.91 50,96 41.718,80.91 27,89.837 27.373,72.627 10.163,73 19.09,58.282 4,50 19.09,41.718 10.163,27 27.373,27.373 27,10.163 41.718,19.09" fill="#ed6a3e" stroke="#1f1a17" strokeWidth="4" strokeLinejoin="round" />
                    <circle cx="38" cy="46" r="3.5" fill="#1f1a17" />
                    <circle cx="62" cy="46" r="3.5" fill="#1f1a17" />
                    <path d="M 38 60 Q 50 70 62 60" fill="none" stroke="#1f1a17" strokeWidth="3" strokeLinecap="round" />
                </svg>
            </div>
        ),
        { ...size }
    );
}
