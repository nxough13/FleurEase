// Simple bad words filter utility
// Filters common profanity and offensive words

const badWordsList = [
    // Common English profanity
    'fuck', 'fucking', 'fucked', 'fucker', 'fck', 'fuk', 'fucks',
    'shit', 'shitty', 'bullshit', 'shits', 'shitting',
    'damn', 'damned', 'dammit', 'damnit',
    'hell', 'bitch', 'bitches', 'bitching', 'bastard', 'bastards',
    'asshole', 'assholes', 'ass', 'arse',
    'crap', 'crappy', 'piss', 'pissed', 'pissing',
    'dick', 'dicks', 'cock', 'cocks', 'pussy', 'pussies',
    'whore', 'whores', 'slut', 'sluts', 'slutty',
    'fag', 'faggot', 'faggots', 'fags',
    'nigger', 'niggers', 'nigga', 'niggas',
    'retard', 'retarded', 'retards',
    'cunt', 'cunts', 'twat', 'twats', 'wanker', 'wankers',
    'bollocks', 'bloody', 'bugger',
    
    // Additional English profanity
    'motherfucker', 'motherfucking', 'motherfuckers',
    'son of a bitch', 'sonofabitch',
    'jackass', 'dumbass', 'dipshit',
    'douche', 'douchebag', 'scumbag',
    'prick', 'pricks', 'bastard',
    
    // Tagalog profanity
    'putang ina', 'putangina', 'puta', 'punyeta', 'punyemas',
    'gago', 'gaga', 'tangina', 'tanginamo', 'tanga',
    'bobo', 'bobong', 'ulol', 'tarantado', 'tarantada',
    'leche', 'peste', 'yawa', 'hayop', 'hayop ka',
    'hinayupak', 'kingina', 'pakyu', 'pak you',
    'shet', 'shuta', 'buwisit', 'bwiset',
    'inutil', 'walang kwenta', 'walang hiya',
    'lintik', 'kupal', 'kantot', 'kantutan',
    'tamod', 'tite', 'bilat', 'puke',
    'bayag', 'burat', 'etits', 'jakol',
    'chupa', 'supot', 'pokpok', 'malandi',
    'salsal', 'kantot', 'kantutan', 'iyot',
    
    // Variations and common misspellings
    'fuk', 'fck', 'fvck', 'phuck',
    'sht', 'shyt', 'sh1t',
    'btch', 'b1tch', 'biatch',
    'azz', 'a$$', 'a55',
    'fag', 'phag', 'f4g',
    'cnt', 'c*nt', 'kunt'
];

// Create regex pattern for case-insensitive matching
const createBadWordsPattern = () => {
    const pattern = badWordsList
        .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special chars
        .join('|');
    return new RegExp(`\\b(${pattern})\\b`, 'gi');
};

const badWordsPattern = createBadWordsPattern();

/**
 * Filter bad words from text
 * @param {string} text - Text to filter
 * @param {string} replacement - Replacement character (default: '*')
 * @returns {string} - Filtered text
 */
const filterBadWords = (text, replacement = '*') => {
    if (!text || typeof text !== 'string') {
        return text;
    }

    return text.replace(badWordsPattern, (match) => {
        return replacement.repeat(match.length);
    });
};

/**
 * Check if text contains bad words
 * @param {string} text - Text to check
 * @returns {boolean} - True if contains bad words
 */
const containsBadWords = (text) => {
    if (!text || typeof text !== 'string') {
        return false;
    }
    return badWordsPattern.test(text);
};

module.exports = {
    filterBadWords,
    containsBadWords,
    badWordsList
};
