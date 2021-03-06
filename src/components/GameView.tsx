import { Box, Grid, HStack, Spinner, VStack } from "@chakra-ui/react";
import React from "react";
import { useEffect, useState } from "react";
import { Game } from "../model/Game";
import { GameState } from "../model/GameState";
import { GameMetricsCollector } from "../utils/GameMetricsCollector";
import { loadGameState, persistGameState } from "../utils/persistance";
import { ClueVault } from "./ClueVault";
import { EndOfGame } from "./EndOfGame";
import { GameHelp } from "./GameHelp";
import { GameProgress } from "./GameProgress";
import { GameStageView } from "./GameStageView";
import { MetricsReport } from "./MetricsReport";
import ReactGA from 'react-ga';

interface GameViewProps {
    game: Game
}

export const GameView = ({ game }: GameViewProps) => {
    const [gameState, setGameState] = useState<GameState | undefined>();

    const handleStageCompleted = () => {
        if (!gameState) {
            return;
        }
        ReactGA.event({
            category: 'Game',
            action: 'Completed stage',
            value: gameState.currentStage
        });
        const newState = { currentStage: gameState.currentStage + 1 };
        persistGameState(newState);
        setGameState(newState);
        window.location = window.location;
    };

    useEffect(() => {
        let previousGameState = loadGameState();

        if (!previousGameState) {
            previousGameState = {
                currentStage: 0
            }
        }
        setGameState(previousGameState);
    }, [])

    if (!gameState) {
        return <Spinner size="xl" />
    }

    const metricsCollector = new GameMetricsCollector(gameState.currentStage);
    const hasNextStage = gameState.currentStage < game.stages.length;
    const currentStage = game.stages[gameState.currentStage];

    return (
        <Grid minH="100vh" p={10}>
            <Box justifySelf="end" >
                <HStack spacing={2} isInline>
                    <ClueVault clues={game.stages.slice(0, gameState.currentStage).map(stage => stage.clue)} />
                    <MetricsReport metrics={metricsCollector.metrics} />
                    <GameHelp />
                </HStack>
            </Box>
            {
                hasNextStage
                    ? <VStack spacing={8}>
                        <GameProgress stageNumber={gameState.currentStage + 1} />
                        <GameStageView stage={currentStage} onStageCompleted={handleStageCompleted} metricsCollector={metricsCollector} />
                    </VStack>
                    : <EndOfGame />
            }
        </Grid>
    )
}