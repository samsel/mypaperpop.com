/** Trigger a browser file download from a URL or blob URL. */
export function triggerDownload(url: string, filename?: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename ?? `mypaperpop-colored-${Date.now()}.png`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
