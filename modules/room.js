const Player = require("./player");
/**
 * Structure which describes a room
 */
class Room {
    /**
     * Create a new room
     * @param {String} code room code
     * @param {String[]} categories array of possible categories
     */
    constructor(code) {
        this.code = code;
        this.players = []; // Array of player objects 
        this.usernames =[];
        //this.score = score; //the overall score of words
    }

   
    /**
     * Returns true if this room has the provided username, false otherwise
     * @param {String} username
     */
    hasPlayer(username) {
        return this.players.filter(player => player.username == username).length == 1;
    }

    
     

  
}
module.exports = Room;