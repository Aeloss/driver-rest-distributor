export const VEHICLE_TYPES = {
    VAN: 'Van',
    TRUCK: 'Camioneta',
    CAR: 'Auto'
};

// Proportional Rest Weights: Higher means the vehicle type RESTS MORE often.
// If Van is 1.0 and Auto is 2.0, the Auto will tend to rest twice as much as the Van.
const VEHICLE_REST_WEIGHT = {
    [VEHICLE_TYPES.VAN]: 1.0,
    [VEHICLE_TYPES.TRUCK]: 1.5,
    [VEHICLE_TYPES.CAR]: 2.0
};

/**
 * Generates a rest schedule for a week using a proportional scoring system.
 * @param {Array} drivers - List of driver objects { id, name, type, priority, preferredRestDays }
 * @param {Object} dailyNeeds - Map of day index (0-6) to number of drivers needed
 * @returns {Object} - Schedule { [driverId]: [day0_rest, day1_rest, ...] }
 */
export const distributeRest = (drivers, dailyNeeds) => {
    const schedule = {};
    drivers.forEach(d => {
        schedule[d.id] = new Array(7).fill(false); // false = working, true = resting
    });

    // Initialize stats for the scoring algorithm
    const driverStats = drivers.map(d => ({
        id: d.id,
        type: d.type,
        weight: VEHICLE_REST_WEIGHT[d.type] || 1.0,
        totalRests: 0,
        isManualPriority: d.priority || false,
        isPrefPriority: d.prefPriority || false,
        preferredRestDays: d.preferredRestDays || []
    }));

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const totalDrivers = drivers.length;
        const needed = dailyNeeds[dayIndex] || 8;
        const restsToAssign = Math.max(0, totalDrivers - needed);

        if (restsToAssign <= 0) continue;

        // We select drivers to REST based on their "Rest Score".
        // Score = totalRests / weight.
        // Drivers with LOADER scores are "under-rested" relative to their type's budget.
        const pool = [...driverStats].map(stat => {
            // PRIORITY BIAS (Work Priority)
            // Manual priority gives a +0.7 advantage to score.
            // This means they rest only after a non-priority peer has 1 rest.
            let score = (stat.totalRests + (stat.isManualPriority ? 0.7 : 0)) / stat.weight;

            // PREFERENCE BONUS
            // If they want to rest today, we lower their score so they are preferred
            if (stat.preferredRestDays.includes(dayIndex)) {
                // If they have preference priority, the bonus is much larger (0.8 instead of 0.15)
                score -= stat.isPrefPriority ? 0.8 : 0.15;
            }

            return { ...stat, currentDayScore: score };
        });

        // Sort by currentDayScore (ASCENDING)
        // The lowest scores rest first.
        pool.sort((a, b) => {
            if (a.currentDayScore !== b.currentDayScore) {
                return a.currentDayScore - b.currentDayScore;
            }
            return Math.random() - 0.5; // Random for stability
        });

        const restingToday = pool.slice(0, restsToAssign);

        restingToday.forEach(chosen => {
            // Update the actual driver stats (not the map copy)
            const realStat = driverStats.find(s => s.id === chosen.id);
            if (realStat) {
                schedule[chosen.id][dayIndex] = true;
                realStat.totalRests += 1;
            }
        });
    }

    return schedule;
};
