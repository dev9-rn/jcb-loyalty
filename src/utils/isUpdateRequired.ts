export const isUpdateRequired = (current: string, latest: string) => {
    const [currentMajor, currentMinor] = current.split('.').map(Number);
    const [latestMajor, latestMinor] = latest.split('.').map(Number);

    return (
        currentMajor < latestMajor ||
        (currentMajor === latestMajor && currentMinor < latestMinor)
    );
};