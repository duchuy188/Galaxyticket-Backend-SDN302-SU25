const Movie = require('../models/Movie');


const updateMovieShowingStatus = async (req, res, next) => {
    try {
        const now = new Date();
        
        const result = await Movie.updateMany(
            {
                releaseDate: { $lte: now },        
                showingStatus: 'coming-soon',       
                status: 'approved',                 
                isActive: true                    
            },
            { 
                $set: { showingStatus: 'now-showing' }
            }
        );

     
        if (result.modifiedCount > 0) {
            console.log(`Updated ${result.modifiedCount} movies to now-showing`);
        }

        next();
    } catch (error) {
        console.error('Error updating movie status:', error);
        next(error);
    }
};

module.exports = { updateMovieShowingStatus };