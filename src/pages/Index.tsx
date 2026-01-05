import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Spell {
  id: string;
  name: string;
  manaCost: number;
  cooldown: number;
  damage: number;
  icon: string;
  currentCooldown: number;
}

interface Character {
  id: string;
  name: string;
  class: string;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  element: 'fire' | 'ice' | 'dark';
  spells: Spell[];
  avatar: string;
}

export default function Index() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [enemyCharacter, setEnemyCharacter] = useState<Character | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const [damageDealt, setDamageDealt] = useState(0);

  const characters: Character[] = [
    {
      id: '1',
      name: 'Игнис',
      class: 'Маг Огня',
      hp: 850,
      maxHp: 850,
      mana: 400,
      maxMana: 400,
      element: 'fire',
      avatar: '🔥',
      spells: [
        { id: 's1', name: 'Огненный шар', manaCost: 50, cooldown: 3, damage: 120, icon: 'Flame', currentCooldown: 0 },
        { id: 's2', name: 'Метеорит', manaCost: 100, cooldown: 8, damage: 280, icon: 'Bomb', currentCooldown: 0 },
        { id: 's3', name: 'Пламенная стена', manaCost: 70, cooldown: 5, damage: 0, icon: 'Shield', currentCooldown: 0 },
        { id: 's4', name: 'Инферно', manaCost: 150, cooldown: 12, damage: 400, icon: 'Zap', currentCooldown: 0 },
      ],
    },
    {
      id: '2',
      name: 'Фростия',
      class: 'Ледяной Чародей',
      hp: 750,
      maxHp: 750,
      mana: 450,
      maxMana: 450,
      element: 'ice',
      avatar: '❄️',
      spells: [
        { id: 's5', name: 'Ледяная стрела', manaCost: 45, cooldown: 2, damage: 100, icon: 'Snowflake', currentCooldown: 0 },
        { id: 's6', name: 'Заморозка', manaCost: 80, cooldown: 6, damage: 150, icon: 'Wind', currentCooldown: 0 },
        { id: 's7', name: 'Ледяной щит', manaCost: 60, cooldown: 4, damage: 0, icon: 'Shield', currentCooldown: 0 },
        { id: 's8', name: 'Абсолютный ноль', manaCost: 140, cooldown: 10, damage: 380, icon: 'CloudSnow', currentCooldown: 0 },
      ],
    },
    {
      id: '3',
      name: 'Умбра',
      class: 'Тёмный Колдун',
      hp: 800,
      maxHp: 800,
      mana: 500,
      maxMana: 500,
      element: 'dark',
      avatar: '🌑',
      spells: [
        { id: 's9', name: 'Тёмный болт', manaCost: 55, cooldown: 3, damage: 110, icon: 'Skull', currentCooldown: 0 },
        { id: 's10', name: 'Вампиризм', manaCost: 90, cooldown: 7, damage: 200, icon: 'Heart', currentCooldown: 0 },
        { id: 's11', name: 'Теневая защита', manaCost: 75, cooldown: 5, damage: 0, icon: 'Ghost', currentCooldown: 0 },
        { id: 's12', name: 'Бездна', manaCost: 160, cooldown: 13, damage: 420, icon: 'Eclipse', currentCooldown: 0 },
      ],
    },
  ];

  const leaderboard = [
    { rank: 1, name: 'Игнис', wins: 156, rating: 2450 },
    { rank: 2, name: 'Умбра', wins: 142, rating: 2380 },
    { rank: 3, name: 'Фростия', wins: 138, rating: 2340 },
    { rank: 4, name: 'Вольт', wins: 124, rating: 2210 },
    { rank: 5, name: 'Терра', wins: 118, rating: 2180 },
  ];

  const achievements = [
    { id: 'a1', name: 'Первая кровь', description: 'Одержите первую победу', icon: 'Sword', unlocked: true },
    { id: 'a2', name: 'Огненная ярость', description: 'Нанесите 10000 урона огнём', icon: 'Flame', unlocked: true },
    { id: 'a3', name: 'Ледяное сердце', description: 'Заморозьте 50 противников', icon: 'Snowflake', unlocked: false },
    { id: 'a4', name: 'Тёмный властелин', description: 'Выиграйте 100 боёв', icon: 'Crown', unlocked: false },
  ];

  const playSound = (type: 'attack' | 'heal' | 'victory' | 'defeat') => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'attack') {
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'heal') {
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } else if (type === 'victory') {
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3);
        osc.start(audioContext.currentTime + i * 0.15);
        osc.stop(audioContext.currentTime + i * 0.15 + 0.3);
      });
    } else if (type === 'defeat') {
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  const enemyTurn = (player: Character, enemy: Character) => {
    const availableSpells = enemy.spells.filter(s => s.manaCost <= enemy.mana && s.currentCooldown === 0);
    if (availableSpells.length === 0) {
      setBattleLog(prev => [...prev, `⏭️ ${enemy.name} пропускает ход (недостаточно маны)`]);
      setIsPlayerTurn(true);
      return;
    }

    const randomSpell = availableSpells[Math.floor(Math.random() * availableSpells.length)];
    const newEnemyMana = enemy.mana - randomSpell.manaCost;
    const restoredEnemyMana = Math.min(newEnemyMana + 30, enemy.maxMana);
    const newPlayerHp = Math.max(0, player.hp - randomSpell.damage);

    playSound('attack');
    setEnemyCharacter({ ...enemy, mana: restoredEnemyMana });
    setSelectedCharacter({ ...player, hp: newPlayerHp });
    setBattleLog(prev => [...prev, `🔮 ${enemy.name} использует ${randomSpell.name}! Урон: ${randomSpell.damage}`]);

    if (newPlayerHp === 0) {
      setBattleLog(prev => [...prev, `💀 Поражение! ${player.name} повержен!`]);
      playSound('defeat');
      setGameOver(true);
      setBattleResult('defeat');
    } else {
      setIsPlayerTurn(true);
    }
  };

  const castSpell = (spell: Spell) => {
    if (!selectedCharacter || !enemyCharacter || !isPlayerTurn || gameOver) return;
    if (selectedCharacter.mana < spell.manaCost) {
      setBattleLog(prev => [...prev, `❌ Недостаточно маны для ${spell.name}`]);
      return;
    }
    if (spell.currentCooldown > 0) {
      setBattleLog(prev => [...prev, `⏳ ${spell.name} на перезарядке`]);
      return;
    }

    playSound('attack');
    const newPlayerMana = selectedCharacter.mana - spell.manaCost;
    const restoredPlayerMana = Math.min(newPlayerMana + 30, selectedCharacter.maxMana);
    const newEnemyHp = Math.max(0, enemyCharacter.hp - spell.damage);

    setSelectedCharacter({ ...selectedCharacter, mana: restoredPlayerMana });
    setEnemyCharacter({ ...enemyCharacter, hp: newEnemyHp });
    setBattleLog(prev => [...prev, `⚔️ ${selectedCharacter.name} использует ${spell.name}! Урон: ${spell.damage}`]);
    setTurnCount(prev => prev + 1);
    setDamageDealt(prev => prev + spell.damage);

    if (newEnemyHp === 0) {
      setBattleLog(prev => [...prev, `🏆 Победа! ${enemyCharacter.name} повержен!`]);
      playSound('victory');
      setGameOver(true);
      setBattleResult('victory');
    } else {
      setIsPlayerTurn(false);
    }
  };

  useEffect(() => {
    if (!isPlayerTurn && selectedCharacter && enemyCharacter && !gameOver) {
      const timer = setTimeout(() => {
        enemyTurn(selectedCharacter, enemyCharacter);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, selectedCharacter, enemyCharacter, gameOver]);

  const startBattle = (player: Character, enemy: Character) => {
    setSelectedCharacter({ ...player });
    setEnemyCharacter({ ...enemy });
    setBattleLog([`⚔️ Бой начат! ${player.name} VS ${enemy.name}`]);
    setIsPlayerTurn(true);
    setGameOver(false);
    setBattleResult(null);
    setTurnCount(0);
    setDamageDealt(0);
  };

  const restartBattle = () => {
    if (!selectedCharacter || !enemyCharacter) return;
    const freshPlayer = characters.find(c => c.id === selectedCharacter.id);
    const freshEnemy = characters.find(c => c.id === enemyCharacter.id);
    if (freshPlayer && freshEnemy) {
      startBattle(freshPlayer, freshEnemy);
    }
  };

  const exitBattle = () => {
    setSelectedCharacter(null);
    setEnemyCharacter(null);
    setBattleLog([]);
    setGameOver(false);
    setBattleResult(null);
    setIsPlayerTurn(true);
    setTurnCount(0);
    setDamageDealt(0);
  };

  const getElementColor = (element: 'fire' | 'ice' | 'dark') => {
    const colors = {
      fire: 'text-fire',
      ice: 'text-ice',
      dark: 'text-dark',
    };
    return colors[element];
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-2 bg-gradient-to-r from-fire via-ice to-dark bg-clip-text text-transparent">
            Battle Arena
          </h1>
          <p className="text-muted-foreground text-lg">Магические поединки за господство</p>
        </header>

        <Tabs defaultValue="characters" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="characters" className="font-heading">
              <Icon name="Users" className="mr-2 h-4 w-4" />
              Персонажи
            </TabsTrigger>
            <TabsTrigger value="arena" className="font-heading">
              <Icon name="Swords" className="mr-2 h-4 w-4" />
              Арена
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="font-heading">
              <Icon name="Trophy" className="mr-2 h-4 w-4" />
              Рейтинг
            </TabsTrigger>
            <TabsTrigger value="achievements" className="font-heading">
              <Icon name="Award" className="mr-2 h-4 w-4" />
              Достижения
            </TabsTrigger>
          </TabsList>

          <TabsContent value="characters">
            <div className="grid md:grid-cols-3 gap-6">
              {characters.map(char => (
                <Card
                  key={char.id}
                  className="p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-xl border-2"
                  onClick={() => startBattle(char, characters.find(c => c.id !== char.id) || characters[0])}
                >
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-3">{char.avatar}</div>
                    <h3 className={`text-2xl font-heading font-bold ${getElementColor(char.element)}`}>
                      {char.name}
                    </h3>
                    <p className="text-muted-foreground">{char.class}</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>HP</span>
                        <span>{char.hp}/{char.maxHp}</span>
                      </div>
                      <Progress value={(char.hp / char.maxHp) * 100} className="h-2 bg-muted" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Мана</span>
                        <span>{char.mana}/{char.maxMana}</span>
                      </div>
                      <Progress value={(char.mana / char.maxMana) * 100} className="h-2 bg-muted [&>div]:bg-mana" />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {char.spells.slice(0, 4).map(spell => (
                      <Badge key={spell.id} variant="outline" className="justify-center py-1">
                        <Icon name={spell.icon as any} className="mr-1 h-3 w-3" />
                        {spell.name}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="arena">
            {selectedCharacter && enemyCharacter ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6 animate-pulse-glow">
                    <div className="text-center mb-4">
                      <div className="text-5xl mb-2">{selectedCharacter.avatar}</div>
                      <h3 className={`text-2xl font-heading font-bold ${getElementColor(selectedCharacter.element)}`}>
                        {selectedCharacter.name}
                      </h3>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <Icon name="Heart" className="mr-1 h-4 w-4 text-destructive" />
                            HP
                          </span>
                          <span>{selectedCharacter.hp}/{selectedCharacter.maxHp}</span>
                        </div>
                        <Progress value={(selectedCharacter.hp / selectedCharacter.maxHp) * 100} className="h-3" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <Icon name="Droplet" className="mr-1 h-4 w-4 text-mana" />
                            Мана
                          </span>
                          <span>{selectedCharacter.mana}/{selectedCharacter.maxMana}</span>
                        </div>
                        <Progress value={(selectedCharacter.mana / selectedCharacter.maxMana) * 100} className="h-3 [&>div]:bg-mana" />
                      </div>
                    </div>

                    <div className="mb-3 text-center">
                      {gameOver ? (
                        <Badge variant="outline" className="text-sm py-1">
                          Бой завершён
                        </Badge>
                      ) : (
                        <Badge variant={isPlayerTurn ? 'default' : 'secondary'} className="text-sm py-1 animate-pulse">
                          {isPlayerTurn ? '🎯 Ваш ход' : '⏳ Ход противника'}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedCharacter.spells.map(spell => (
                        <Button
                          key={spell.id}
                          onClick={() => castSpell(spell)}
                          disabled={!isPlayerTurn || gameOver || selectedCharacter.mana < spell.manaCost || spell.currentCooldown > 0}
                          className="flex flex-col items-center gap-1 h-auto py-3"
                          variant={selectedCharacter.mana >= spell.manaCost && isPlayerTurn && !gameOver ? 'default' : 'outline'}
                        >
                          <Icon name={spell.icon as any} className="h-5 w-5" />
                          <span className="text-xs font-semibold">{spell.name}</span>
                          <div className="flex gap-2 text-xs">
                            <span className="text-mana">{spell.manaCost}M</span>
                            <span className="text-destructive">{spell.damage}D</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="text-center mb-4">
                      <div className="text-5xl mb-2">{enemyCharacter.avatar}</div>
                      <h3 className={`text-2xl font-heading font-bold ${getElementColor(enemyCharacter.element)}`}>
                        {enemyCharacter.name}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <Icon name="Heart" className="mr-1 h-4 w-4 text-destructive" />
                            HP
                          </span>
                          <span>{enemyCharacter.hp}/{enemyCharacter.maxHp}</span>
                        </div>
                        <Progress value={(enemyCharacter.hp / enemyCharacter.maxHp) * 100} className="h-3" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <Icon name="Droplet" className="mr-1 h-4 w-4 text-mana" />
                            Мана
                          </span>
                          <span>{enemyCharacter.mana}/{enemyCharacter.maxMana}</span>
                        </div>
                        <Progress value={(enemyCharacter.mana / enemyCharacter.maxMana) * 100} className="h-3 [&>div]:bg-mana" />
                      </div>
                    </div>
                  </Card>
                </div>

                {battleResult ? (
                  <Card className={`p-8 text-center ${battleResult === 'victory' ? 'border-fire' : 'border-destructive'} border-2 animate-scale-in`}>
                    <div className="mb-4">
                      <div className="text-8xl mb-4 animate-spell-cast">
                        {battleResult === 'victory' ? '🏆' : '💀'}
                      </div>
                      <h2 className={`text-4xl font-heading font-bold mb-2 ${battleResult === 'victory' ? 'text-fire' : 'text-destructive'}`}>
                        {battleResult === 'victory' ? 'Победа!' : 'Поражение'}
                      </h2>
                      <p className="text-muted-foreground text-lg mb-6">
                        {battleResult === 'victory' 
                          ? `${enemyCharacter.name} повержен в бою!` 
                          : `${selectedCharacter.name} пал в неравной схватке`}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6 max-w-md mx-auto">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <Icon name="Zap" className="h-6 w-6 mx-auto mb-2 text-fire" />
                        <div className="text-2xl font-heading font-bold">{damageDealt}</div>
                        <div className="text-xs text-muted-foreground">Урона</div>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <Icon name="Swords" className="h-6 w-6 mx-auto mb-2 text-ice" />
                        <div className="text-2xl font-heading font-bold">{turnCount}</div>
                        <div className="text-xs text-muted-foreground">Ходов</div>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <Icon name="Heart" className="h-6 w-6 mx-auto mb-2 text-destructive" />
                        <div className="text-2xl font-heading font-bold">{selectedCharacter.hp}</div>
                        <div className="text-xs text-muted-foreground">HP осталось</div>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-center">
                      <Button onClick={restartBattle} size="lg" className="font-heading">
                        <Icon name="RotateCcw" className="mr-2 h-5 w-5" />
                        Реванш
                      </Button>
                      <Button onClick={exitBattle} variant="outline" size="lg" className="font-heading">
                        <Icon name="ArrowLeft" className="mr-2 h-5 w-5" />
                        Выход
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-4">
                    <h4 className="font-heading font-semibold mb-2 flex items-center">
                      <Icon name="ScrollText" className="mr-2 h-4 w-4" />
                      Журнал боя
                    </h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {battleLog.map((log, i) => (
                        <p key={i} className="text-sm text-muted-foreground">{log}</p>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Icon name="Swords" className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-2xl font-heading font-bold mb-2">Выберите персонажа</h3>
                <p className="text-muted-foreground">Перейдите во вкладку "Персонажи" и кликните на бойца</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card className="p-6">
              <div className="space-y-4">
                {leaderboard.map(player => (
                  <div
                    key={player.rank}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-3xl font-heading font-bold ${player.rank === 1 ? 'text-fire' : player.rank === 2 ? 'text-ice' : 'text-dark'}`}>
                        #{player.rank}
                      </div>
                      <div>
                        <h4 className="font-heading font-semibold text-lg">{player.name}</h4>
                        <p className="text-sm text-muted-foreground">{player.wins} побед</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-heading font-bold text-primary">{player.rating}</div>
                      <p className="text-xs text-muted-foreground">рейтинг</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid md:grid-cols-2 gap-4">
              {achievements.map(achievement => (
                <Card
                  key={achievement.id}
                  className={`p-6 ${achievement.unlocked ? 'border-primary' : 'opacity-60'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${achievement.unlocked ? 'bg-primary/20' : 'bg-muted'}`}>
                      <Icon name={achievement.icon as any} className={`h-6 w-6 ${achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-heading font-semibold">{achievement.name}</h4>
                        {achievement.unlocked && (
                          <Badge variant="default" className="text-xs">
                            <Icon name="Check" className="h-3 w-3 mr-1" />
                            Разблокировано
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}