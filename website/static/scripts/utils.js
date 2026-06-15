/**
 * Converts a YouTube transcript timestamp from seconds to hh:mm:ss
 * 
 * @param {string|number} timestamp time of video in seconds
 * @returns {string} timestamp in mm:ss or hh:mm:ss
 */
export function formatTimestamp(timestamp) {
    const totalSeconds = (Math.floor(Number(timestamp)));

    // Get hours, minutes, and seconds from total seconds
    const minutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalSeconds / 3600);
    const seconds = totalSeconds % 60;

    // Array with parts for final timestamp
    const parts = [];
    
    // Add values to final timestamp
    if (hours > 0) {
        parts.push(String(hours).padStart(2, '0'));
    }
    parts.push(String(minutes).padStart(2, '0'));
    parts.push(String(seconds).padStart(2, '0'));

    return parts.join(':')
}

/**
 * Rounds a number of seconds to minutes, hours, days, months, or years
 */
export function formatSeconds(seconds) {
    const timeFrames = ['y', 'mo', 'd', 'h', 'm'];
    const divisionFactors = [31536000, 2592000, 86400, 3600, 60];

    let index = 0;
    for (const factor of divisionFactors) {
        if (seconds / factor >= 1) {
            let time = Math.round(seconds / factor * 10) / 10;
            let timeFrame = timeFrames[index];

            if (time == divisionFactors[index - 1] / factor) {
                time = 1;
                timeFrame = timeFrames[index - 1];
            }
            
            return `${time}${timeFrame}`;
        }
        index++;
    }
    return '<1m';
}