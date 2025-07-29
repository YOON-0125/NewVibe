import { GameMap, Tile, Position } from '../../shared/types';
import { TileType } from '../../shared/enums';
import { MAP_CONFIG } from '../../shared/constants';
import { MathUtils } from '../../shared/utils';

/**
 * 방 정보
 */
interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

/**
 * 맵 시스템
 * 던전 생성, 타일 관리, 충돌 검사 등을 담당
 */
export class MapSystem {
  private currentMap: GameMap | null = null;
  private rooms: Room[] = [];

  constructor() {
    console.log('MapSystem initialized');
  }

  /**
   * 새로운 맵 생성 (별칭)
   */
  public generateMap(width?: number, height?: number): GameMap {
    return this.generateDungeon(width, height);
  }

  /**
   * 새로운 던전 생성
   */
  public generateDungeon(width?: number, height?: number): GameMap {
    const mapWidth = width || MathUtils.randomInt(MAP_CONFIG.MIN_MAP_WIDTH, MAP_CONFIG.MAX_MAP_WIDTH);
    const mapHeight = height || MathUtils.randomInt(MAP_CONFIG.MIN_MAP_HEIGHT, MAP_CONFIG.MAX_MAP_HEIGHT);

    // 맵 초기화 (모든 타일을 벽으로)
    const tiles: Tile[][] = [];
    for (let x = 0; x < mapWidth; x++) {
      tiles[x] = [];
      for (let y = 0; y < mapHeight; y++) {
        tiles[x][y] = this.createTile(TileType.Wall, { x, y });
      }
    }

    // 방 생성
    this.rooms = [];
    const numRooms = MathUtils.randomInt(5, MAP_CONFIG.MAX_ROOMS);

    for (let i = 0; i < numRooms; i++) {
      const room = this.generateRoom(mapWidth, mapHeight);
      
      if (this.canPlaceRoom(room)) {
        this.carveRoom(tiles, room);
        this.rooms.push(room);
      }
    }

    // 방들을 복도로 연결
    this.connectRooms(tiles);

    // 출입구 설정
    const spawnRoom = this.rooms[0];
    const spawnPoint: Position = {
      x: spawnRoom.centerX,
      y: spawnRoom.centerY,
    };

    const exitRoom = this.rooms[this.rooms.length - 1];
    const exitPoint: Position = {
      x: exitRoom.centerX,
      y: exitRoom.centerY,
    };

    // 계단 타일 설정
    tiles[exitPoint.x][exitPoint.y] = this.createTile(TileType.Stairs, exitPoint);

    const gameMap: GameMap = {
      width: mapWidth,
      height: mapHeight,
      tiles,
      spawnPoint,
      exitPoint,
    };

    this.currentMap = gameMap;
    console.log(`Generated dungeon: ${mapWidth}x${mapHeight} with ${this.rooms.length} rooms`);

    return gameMap;
  }

  /**
   * 타일 생성
   */
  private createTile(type: TileType, position: Position): Tile {
    return {
      type,
      position: { ...position },
      walkable: this.isTileWalkable(type),
      visible: false,
      explored: false,
    };
  }

  /**
   * 타일이 이동 가능한지 확인
   */
  private isTileWalkable(type: TileType): boolean {
    switch (type) {
      case TileType.Floor:
      case TileType.Door:
      case TileType.Stairs:
        return true;
      case TileType.Wall:
      case TileType.Empty:
        return false;
      default:
        return false;
    }
  }

  /**
   * 방 생성
   */
  private generateRoom(mapWidth: number, mapHeight: number): Room {
    const width = MathUtils.randomInt(MAP_CONFIG.MIN_ROOM_SIZE, MAP_CONFIG.MAX_ROOM_SIZE);
    const height = MathUtils.randomInt(MAP_CONFIG.MIN_ROOM_SIZE, MAP_CONFIG.MAX_ROOM_SIZE);
    const x = MathUtils.randomInt(1, mapWidth - width - 1);
    const y = MathUtils.randomInt(1, mapHeight - height - 1);

    return {
      x,
      y,
      width,
      height,
      centerX: Math.floor(x + width / 2),
      centerY: Math.floor(y + height / 2),
    };
  }

  /**
   * 방 배치 가능 여부 확인
   */
  private canPlaceRoom(newRoom: Room): boolean {
    return !this.rooms.some(existingRoom => this.roomsOverlap(newRoom, existingRoom));
  }

  /**
   * 방 겹침 확인
   */
  private roomsOverlap(room1: Room, room2: Room): boolean {
    return !(
      room1.x + room1.width + 1 < room2.x ||
      room2.x + room2.width + 1 < room1.x ||
      room1.y + room1.height + 1 < room2.y ||
      room2.y + room2.height + 1 < room1.y
    );
  }

  /**
   * 방 파기 (바닥 타일로 변경)
   */
  private carveRoom(tiles: Tile[][], room: Room): void {
    for (let x = room.x; x < room.x + room.width; x++) {
      for (let y = room.y; y < room.y + room.height; y++) {
        tiles[x][y] = this.createTile(TileType.Floor, { x, y });
      }
    }
  }

  /**
   * 방들을 복도로 연결
   */
  private connectRooms(tiles: Tile[][]): void {
    for (let i = 1; i < this.rooms.length; i++) {
      const prevRoom = this.rooms[i - 1];
      const currentRoom = this.rooms[i];

      this.carveTunnel(tiles, prevRoom.centerX, prevRoom.centerY, currentRoom.centerX, currentRoom.centerY);
    }
  }

  /**
   * 복도 파기
   */
  private carveTunnel(tiles: Tile[][], x1: number, y1: number, x2: number, y2: number): void {
    let x = x1;
    let y = y1;

    // 수평으로 먼저 이동
    while (x !== x2) {
      tiles[x][y] = this.createTile(TileType.Floor, { x, y });
      x += x < x2 ? 1 : -1;
    }

    // 수직으로 이동
    while (y !== y2) {
      tiles[x][y] = this.createTile(TileType.Floor, { x, y });
      y += y < y2 ? 1 : -1;
    }

    // 끝점
    tiles[x2][y2] = this.createTile(TileType.Floor, { x: x2, y: y2 });
  }

  /**
   * 충돌 검사
   */
  public canMoveTo(position: Position): boolean {
    if (!this.currentMap) return false;

    const { x, y } = position;

    // 맵 경계 확인
    if (x < 0 || x >= this.currentMap.width || y < 0 || y >= this.currentMap.height) {
      return false;
    }

    // 타일 이동 가능 여부 확인
    return this.currentMap.tiles[x][y].walkable;
  }

  /**
   * 특정 위치의 타일 가져오기
   */
  public getTileAt(position: Position): Tile | null {
    if (!this.currentMap) return null;

    const { x, y } = position;

    if (x < 0 || x >= this.currentMap.width || y < 0 || y >= this.currentMap.height) {
      return null;
    }

    return this.currentMap.tiles[x][y];
  }

  /**
   * 시야 업데이트 (간단한 원형 시야)
   */
  public updateVision(centerPosition: Position, radius: number = MAP_CONFIG.VISION_RADIUS): void {
    if (!this.currentMap) return;

    // 모든 타일 비가시화
    for (let x = 0; x < this.currentMap.width; x++) {
      for (let y = 0; y < this.currentMap.height; y++) {
        this.currentMap.tiles[x][y].visible = false;
      }
    }

    // 시야 범위 내 타일 가시화
    for (let x = Math.max(0, centerPosition.x - radius); x <= Math.min(this.currentMap.width - 1, centerPosition.x + radius); x++) {
      for (let y = Math.max(0, centerPosition.y - radius); y <= Math.min(this.currentMap.height - 1, centerPosition.y + radius); y++) {
        const distance = MathUtils.distance(centerPosition, { x, y });
        
        if (distance <= radius) {
          this.currentMap.tiles[x][y].visible = true;
          this.currentMap.tiles[x][y].explored = true;
        }
      }
    }
  }

  /**
   * 가장 가까운 빈 타일 찾기
   */
  public findNearestWalkableTile(position: Position): Position | null {
    if (!this.currentMap) return null;

    const maxRadius = Math.max(this.currentMap.width, this.currentMap.height);

    for (let radius = 0; radius <= maxRadius; radius++) {
      for (let x = Math.max(0, position.x - radius); x <= Math.min(this.currentMap.width - 1, position.x + radius); x++) {
        for (let y = Math.max(0, position.y - radius); y <= Math.min(this.currentMap.height - 1, position.y + radius); y++) {
          if (this.currentMap.tiles[x][y].walkable) {
            return { x, y };
          }
        }
      }
    }

    return null;
  }

  /**
   * 랜덤한 빈 타일 위치 찾기
   */
  public findRandomWalkableTile(): Position | null {
    if (!this.currentMap) return null;

    const walkableTiles: Position[] = [];

    for (let x = 0; x < this.currentMap.width; x++) {
      for (let y = 0; y < this.currentMap.height; y++) {
        if (this.currentMap.tiles[x][y].walkable) {
          walkableTiles.push({ x, y });
        }
      }
    }

    if (walkableTiles.length === 0) return null;

    return MathUtils.randomChoice(walkableTiles);
  }

  /**
   * A* 길찾기 (간단한 구현)
   */
  public findPath(start: Position, end: Position): Position[] | null {
    if (!this.currentMap || !this.canMoveTo(start) || !this.canMoveTo(end)) {
      return null;
    }

    // 간단한 구현을 위해 직선 경로로 대체 (추후 A* 알고리즘 구현)
    const path: Position[] = [];
    let current = { ...start };

    while (current.x !== end.x || current.y !== end.y) {
      if (current.x < end.x) current.x++;
      else if (current.x > end.x) current.x--;
      
      if (current.y < end.y) current.y++;
      else if (current.y > end.y) current.y--;

      if (this.canMoveTo(current)) {
        path.push({ ...current });
      } else {
        // 경로가 막혔으면 실패
        return null;
      }
    }

    return path;
  }

  /**
   * 맵 통계 정보
   */
  public getMapStats(): {
    totalTiles: number;
    walkableTiles: number;
    rooms: number;
    walkablePercentage: number;
  } | null {
    if (!this.currentMap) return null;

    let totalTiles = 0;
    let walkableTiles = 0;

    for (let x = 0; x < this.currentMap.width; x++) {
      for (let y = 0; y < this.currentMap.height; y++) {
        totalTiles++;
        if (this.currentMap.tiles[x][y].walkable) {
          walkableTiles++;
        }
      }
    }

    return {
      totalTiles,
      walkableTiles,
      rooms: this.rooms.length,
      walkablePercentage: (walkableTiles / totalTiles) * 100,
    };
  }

  // Getters
  public getCurrentMap(): GameMap | null {
    return this.currentMap;
  }

  public getRooms(): Room[] {
    return [...this.rooms];
  }

  public getMapSize(): { width: number; height: number } | null {
    if (!this.currentMap) return null;
    
    return {
      width: this.currentMap.width,
      height: this.currentMap.height,
    };
  }
}
