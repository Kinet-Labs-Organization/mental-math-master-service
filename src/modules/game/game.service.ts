import {
  Injectable,
} from "@nestjs/common";
import {
  MOCK_API_DELAY,
} from "@/src/utils/mock";
import * as games from "@/src/utils/gameConfig";

@Injectable()
export class GameService {

  async gameLevels(gameLevel: string) {
    const gameLevelData = games[gameLevel];
    const response = await new Promise((resolve) =>
      setTimeout(() => resolve(gameLevelData), MOCK_API_DELAY),
    );
    return response;
  }

  async fetchGame(gameData:any) {
    const {id, type} = gameData;
    const gameTypeLevel = id.substring(0, id.lastIndexOf("_"));
    const gameId = parseInt(id.substring(id.lastIndexOf("_") + 1));
    const selctedGameConfig = games[gameTypeLevel][gameId - 1];
    let gameDataResponse;
    if(type === 'flash'){
      gameDataResponse = this.flashGame(selctedGameConfig)
    } else if(type === 'regular') {
      gameDataResponse = this.regularGame(selctedGameConfig);
    }
    const response = await new Promise((resolve) =>
      setTimeout(() => resolve(gameDataResponse), MOCK_API_DELAY),
    );
    return response;
  }

  async fetchCustomGame(gameData: any) {
    const game = {
      digitCount: gameData.digitCount,
      numberCount: gameData.numberCount,
      operations: gameData.operations === 'add-subtract' ? ['add', 'subtract'] : [gameData.operations],
      gameType: gameData.gameType,
      numberOfQuestions: gameData.numberOfQuestions,
    };
    let gameDataResponse;
    if(gameData.gameType === 'flash'){
      gameDataResponse = this.flashGame(game)
    } else {
      gameDataResponse = this.regularGame(game);
    }
    const response = await new Promise((resolve) =>
      setTimeout(() => resolve(gameDataResponse), MOCK_API_DELAY),
    );
    return response;
  }

  flashGame(game: any) {
    const min = Math.pow(10, game.digitCount - 1);
    const max = Math.pow(10, game.digitCount) - 1;
    const newNumbers: any[] = [];
    for (let i = 0; i < game.numberCount; i++) {
      const value = Math.floor(Math.random() * (max - min + 1)) + min;
      const operation =
        game.operations[Math.floor(Math.random() * game.operations.length)];
      newNumbers.push({ value, operation });
    }
    newNumbers[0].operation = '';
    return newNumbers;
  }

  regularGame(game: any) {
    const gameData: any[] = [];
    for(let i = 0; i < game.numberOfQuestions; i++) {
      gameData.push(this.flashGame(game));
    }
    return gameData;
  }

}
