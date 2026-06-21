import { ImageResponse } from 'next/og';

export const alt = 'MyPaperPop — AI Coloring Page Generator for Kids';

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default function OgImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f5efe3',
                    fontFamily: 'sans-serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 80,
                        height: 80,
                        marginBottom: 28,
                    }}
                >
                    <svg
                        width="80"
                        height="80"
                        viewBox="0 0 100 100"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <polygon points="50,4 58.282,19.09 73,10.163 72.627,27.373 89.837,27 80.91,41.718 96,50 80.91,58.282 89.837,73 72.627,72.627 73,89.837 58.282,80.91 50,96 41.718,80.91 27,89.837 27.373,72.627 10.163,73 19.09,58.282 4,50 19.09,41.718 10.163,27 27.373,27.373 27,10.163 41.718,19.09" fill="#ed6a3e" stroke="#1f1a17" strokeWidth="4" strokeLinejoin="round" />
                        <circle cx="38" cy="46" r="3.5" fill="#1f1a17" />
                        <circle cx="62" cy="46" r="3.5" fill="#1f1a17" />
                        <path d="M 38 60 Q 50 70 62 60" fill="none" stroke="#1f1a17" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                </div>

                <div
                    style={{
                        display: 'flex',
                        fontSize: 64,
                        fontWeight: 800,
                        color: '#1f1a17',
                        letterSpacing: '0',
                        lineHeight: 1.1,
                    }}
                >
                    MyPaperPop
                </div>

                <div
                    style={{
                        display: 'flex',
                        fontSize: 30,
                        fontWeight: 500,
                        color: '#20486b',
                        marginTop: 16,
                        letterSpacing: '0',
                    }}
                >
                    Coloring pages for any wish
                </div>

                <div
                    style={{
                        display: 'flex',
                        fontSize: 20,
                        fontWeight: 400,
                        color: '#1f1a17',
                        marginTop: 20,
                        maxWidth: 600,
                        textAlign: 'center',
                        lineHeight: 1.4,
                    }}
                >
                    Describe anything, print it in seconds. Free to start.
                </div>
            </div>
        ),
        { ...size }
    );
}
