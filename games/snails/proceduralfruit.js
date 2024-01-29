function* seedRandom(seed) {
    let seed1 = seed;
    let seed2 = seed;
    while(true) {
        seed1 = (seed1 * 9301 + 49297) % 233280;
        seed2 = (seed2 * 49297 + 233280) % 9301;
        yield (seed1 + seed2) / 233280;
    }
}