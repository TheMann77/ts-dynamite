import { Gamestate, BotSelection } from '../models/gamestate';

//Openly Losing Intentionally Via Intelligent Automation

//Draw with p=0.2, c. 1900 round
//(>=)1 draw - 380
//2 draw - 76
//3 draw - 15.2
//4 draw - 3.0
//5 draw - .61


class Bot {
    private score: number[];
    private dyns: number[];
    private played;
    private roundValue;
    private oppo_draw_plays;
    private dyn_vals;
    private losing;
    constructor() {
        this.score = [0,0];
        this.dyns = [100,100];
        this.played = [
            {'R': 0, 'P': 0, 'S': 0, 'D': 0, 'W': 0},
            {'R': 0, 'P': 0, 'S': 0, 'D': 0, 'W': 0}
        ];
        this.roundValue = 1;
        this.oppo_draw_plays = []
        for (let i = 0; i < 50; i++) {
            this.oppo_draw_plays.push({'D':0, 'W':0, 'O':0})
        }
        this.dyn_vals = [];
        this.losing = false;
    }

    private winner = {
        'R': {'R': 2, 'P': 1, 'S': 0, 'D': 1, 'W': 0},
        'P': {'R': 0, 'P': 2, 'S': 1, 'D': 1, 'W': 0},
        'S': {'R': 1, 'P': 0, 'S': 2, 'D': 1, 'W': 0},
        'D': {'R': 0, 'P': 0, 'S': 0, 'D': 2, 'W': 1},
        'W': {'R': 1, 'P': 1, 'S': 1, 'D': 0, 'W': 2},
    }

    makeMove(gamestate: Gamestate): BotSelection {
        //console.log(this.score);
        if (gamestate.rounds.length > 0) {
            const last_turn = gamestate.rounds[gamestate.rounds.length-1];
            const last_winner = this.winner[last_turn.p1][last_turn.p2];
            if (last_turn.p2 === 'D') {
                this.oppo_draw_plays[this.roundValue - 1]['D']++;
            } else if (last_turn.p2 === 'W') {
                this.oppo_draw_plays[this.roundValue - 1]['W']++;
            } else {
                this.oppo_draw_plays[this.roundValue - 1]['O']++;
            }

            if (last_winner !== 2) {
                this.score[last_winner] += this.roundValue;
                this.roundValue = 1;
            } else {this.roundValue++}
            if (last_turn.p1 === 'D') this.dyns[0] -= 1;
            if (last_turn.p2 === 'D') this.dyns[1] -= 1;
            this.played[0][last_turn.p1] += 1;
            this.played[1][last_turn.p2] += 1;
        }

        let l = gamestate.rounds.length;
        if (l==5 && gamestate.rounds[0].p2 === 'R' && gamestate.rounds[1].p2 === 'P' && gamestate.rounds[2].p2 === 'S' && gamestate.rounds[3].p2 === 'R' && gamestate.rounds[4].p2 === 'R') {
            this.losing = true;
        }

        if (this.losing) {return 'W'}

        const ave_rounds_left = (1000 - Math.max(this.score[0], this.score[1])) / 1000 * 1900;

        let dyn_val = 0;
        let water_val = 0;
        let other_val = 0;

        const oppo_plays = this.oppo_draw_plays[this.roundValue - 1];
        const total_oppo_plays = oppo_plays['D'] + oppo_plays['W'] + oppo_plays['O'];

        if (total_oppo_plays === 0) {
            const dyn_prob = Math.min((this.roundValue-1) * 5 * this.dyns[0] / ave_rounds_left, 0.6);
            const water_prob = Math.min((this.roundValue-2) * 5 * this.dyns[0] / ave_rounds_left, 0.6);

            if (Math.random() < dyn_prob) {return 'D'}
            else if (Math.random() < water_prob) {return 'W'}
            else {
                const r = Math.random();
                if (r < 1/3) {return 'R'}
                else if (r < 2/3) {return 'P'}
                else {return 'S'}
            }
        }

        // If oppo plays dynamite:
        const oppo_dyn_prob = oppo_plays['D'] / total_oppo_plays;
        other_val -= oppo_dyn_prob;
        water_val += oppo_dyn_prob;

        // If oppo plays water:
        const oppo_water_prob = oppo_plays['W'] / total_oppo_plays;
        dyn_val -= oppo_water_prob;
        other_val += oppo_water_prob;

        const oppo_other_prob = oppo_plays['O'] / total_oppo_plays;
        dyn_val += oppo_other_prob;
        water_val -= oppo_other_prob;

        dyn_val *= this.roundValue;
        water_val *= this.roundValue;
        other_val *= this.roundValue;

        //console.log(oppo_dyn_prob, oppo_water_prob, oppo_other_prob);
        //console.log(dyn_val, water_val, other_val);

        if (water_val > other_val && water_val >= dyn_val) {return 'W'}
        else if (other_val >= water_val && other_val >= dyn_val) {
            if (Math.random() < 1/3) {return 'R'} else if (Math.random() < 1/2) {return 'P'} else {return 'S'}
        }
        const difference = dyn_val - Math.max(water_val, other_val);

        this.dyn_vals.push(dyn_val);
        this.dyn_vals.sort();
        const better_to_come = ave_rounds_left - (this.dyn_vals.indexOf(dyn_val) / this.dyn_vals.length * ave_rounds_left)
        if (better_to_come <= this.dyns[0]) {return 'D'}
        else if (water_val > other_val) {return 'W'}
        else {if (Math.random() < 1/3) {return 'R'} else if (Math.random() < 1/2) {return 'P'} else {return 'S'}}




        /*if (opp_water_prob > 0) {
            dyn_prob = Math.min(this.roundValue * this.dyns[0] / ave_rounds_left, 0.5);
        } else {
            dyn_prob = (this.roundValue >= threshold && this.dyns[0] > 0) ? 1 : 0;
        }

        if (Math.random() < dyn_prob) {return 'D'}
        else {
            const r = Math.random();
            if (r < 1/3) {return 'R'}
            else if (r < 2/3) {return 'P'}
            else {return 'S'}
        }*/
    }
}

export = new Bot();
