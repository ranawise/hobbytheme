// Uses window so the signal is shared across webpack async chunks.
// PlayersContainer (one chunk) sets it; Console (another chunk) reads it.
const w = window as Record<string, unknown>;

const stripAnsi = (s: string) => s.replace(/\x1B\[[0-9;]*[mGKHF]/g, '');

export const activateListFilter = () => {
    w.__pteroListFilter = true;
    if (w.__pteroListTimer) clearTimeout(w.__pteroListTimer as ReturnType<typeof setTimeout>);
    w.__pteroListTimer = setTimeout(() => { w.__pteroListFilter = false; }, 6000);
};

// Returns true when the line is list-command output AND the Players page fired it.
export const consumeIfListOutput = (line: string): boolean => {
    if (!w.__pteroListFilter) return false;
    const clean = stripAnsi(line).trim();
    const content = clean.replace(/^\[[\d:]+\]\s+(?:\[[^\]]+\]\s*)?:?\s*/, '').trim();
    const isEcho = /^list\s*$/i.test(content);
    const isResponse = /players online:/i.test(clean);
    if (isEcho || isResponse) {
        if (isResponse) {
            w.__pteroListFilter = false;
            if (w.__pteroListTimer) clearTimeout(w.__pteroListTimer as ReturnType<typeof setTimeout>);
        }
        return true;
    }
    return false;
};
