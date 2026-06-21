import type { Metadata } from 'next';
import { PrintClient } from './print-client';

export const metadata: Metadata = {
    title: 'Print Preview | MyPaperPop',
    robots: {
        index: false,
        follow: false,
    },
};

export default function PrintPage() {
    return <PrintClient />;
}
