import { users, servers, cars, type User, type InsertUser, type Server, type InsertServer, type Car, type InsertCar } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Server operations
  getAllServers(): Promise<Server[]>;
  getServerById(id: number): Promise<Server | undefined>;
  getServersByCategory(category: string): Promise<Server[]>;
  createServer(server: InsertServer): Promise<Server>;
  updateServer(id: number, server: Partial<InsertServer>): Promise<Server | undefined>;
  deleteServer(id: number): Promise<boolean>;
  
  // Car operations
  getAllCars(): Promise<Car[]>;
  getCarById(id: number): Promise<Car | undefined>;
  getCarsByCategory(category: string): Promise<Car[]>;
  getCarsByServer(serverId: number): Promise<Car[]>;
  createCar(car: InsertCar): Promise<Car>;
  updateCar(id: number, car: Partial<InsertCar>): Promise<Car | undefined>;
  deleteCar(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }

  // Server operations
  async getAllServers(): Promise<Server[]> {
    return await db.select().from(servers);
  }

  async getServerById(id: number): Promise<Server | undefined> {
    const [server] = await db.select().from(servers).where(eq(servers.id, id));
    return server;
  }

  async getServersByCategory(category: string): Promise<Server[]> {
    return await db.select().from(servers).where(eq(servers.category, category));
  }

  async createServer(server: InsertServer): Promise<Server> {
    const [createdServer] = await db.insert(servers).values(server).returning();
    return createdServer;
  }

  async updateServer(id: number, serverUpdate: Partial<InsertServer>): Promise<Server | undefined> {
    const [updatedServer] = await db
      .update(servers)
      .set({ ...serverUpdate, lastUpdated: new Date() })
      .where(eq(servers.id, id))
      .returning();
    return updatedServer;
  }

  async deleteServer(id: number): Promise<boolean> {
    const result = await db.delete(servers).where(eq(servers.id, id));
    return true; // PostgreSQL doesn't return deleted count easily with Drizzle ORM
  }

  // Car operations
  async getAllCars(): Promise<Car[]> {
    return await db.select().from(cars);
  }

  async getCarById(id: number): Promise<Car | undefined> {
    const [car] = await db.select().from(cars).where(eq(cars.id, id));
    return car;
  }

  async getCarsByCategory(category: string): Promise<Car[]> {
    return await db.select().from(cars).where(eq(cars.category, category));
  }

  async getCarsByServer(serverId: number): Promise<Car[]> {
    return await db.select().from(cars).where(eq(cars.serverId, serverId));
  }

  async createCar(car: InsertCar): Promise<Car> {
    const [createdCar] = await db.insert(cars).values(car).returning();
    return createdCar;
  }

  async updateCar(id: number, carUpdate: Partial<InsertCar>): Promise<Car | undefined> {
    const [updatedCar] = await db
      .update(cars)
      .set({ ...carUpdate, uploadedAt: new Date() })
      .where(eq(cars.id, id))
      .returning();
    return updatedCar;
  }

  async deleteCar(id: number): Promise<boolean> {
    const result = await db.delete(cars).where(eq(cars.id, id));
    return true; // PostgreSQL doesn't return deleted count easily with Drizzle ORM
  }

  // Additional database-specific methods
  async initializeWithSampleData() {
    // Check if we have any users
    const result = await db.select().from(users);
    const userCount = result.length;
    
    if (userCount === 0) {
      // Create admin user
      await this.createUser({
        username: "admin",
        password: "admin123", // In a real app, this would be hashed
        isAdmin: true
      });
      
      // Create sample servers
      const server1 = await this.createServer({
        name: "GT3 Racing Challenge",
        description: "High-speed GT3 racing on world-class circuits",
        category: "GT3",
        map: "Nürburgring GP",
        maxPlayers: 24,
        currentPlayers: 16,
        isOnline: true,
        imageUrl: "https://pixabay.com/get/ge27d2d22d1bd66c58a848f5fb277ad1e9fbb23b545ffd07e606218a584cc506454b9e412e7b4df2444809338e4b0738e43085a0b444f62325a33b1541181219d_1280.jpg",
        connectionLink: "https://acstuff.ru/s/q:race/online/join?ip=82.67.56.137&httpPort=11411",
        trackCount: 4
      });
  
      const server2 = await this.createServer({
        name: "Drift Masters",
        description: "Perfect your drift skills on technical tracks",
        category: "Drift",
        map: "Ebisu Minami",
        maxPlayers: 16,
        currentPlayers: 12,
        isOnline: true,
        imageUrl: "https://pixabay.com/get/g001134635ba7f909563da3c840a5fe36824c3b854bb8b5e33d89c1bc9b172e2e1d7db5bf15c7b1cfd42a5f6af6a346d337b78da8287d2e0b49ccb1539b6c9ef1_1280.jpg",
        connectionLink: "https://acstuff.ru/s/q:race/online/join?ip=82.67.56.138&httpPort=11411",
        trackCount: 3
      });
  
      const server3 = await this.createServer({
        name: "Touge Mountain Pass",
        description: "Challenging mountain roads for touge racing",
        category: "Touge",
        map: "Akina Downhill",
        maxPlayers: 12,
        currentPlayers: 8,
        isOnline: true,
        imageUrl: "https://pixabay.com/get/g60b2647f2db0a4aaf8210599e7946cf0a332da9ad074e174f28df0f6f1fd5dd0a91d81bbf1e0141ad98674617d11eee05f1be265b0de8b042690f464f2283559_1280.jpg",
        connectionLink: "https://acstuff.ru/s/q:race/online/join?ip=82.67.56.139&httpPort=11411",
        trackCount: 5
      });
  
      // Add cars
      await this.createCar({
        name: "Ferrari 488 GT3",
        category: "GT",
        imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        downloadUrl: "/api/cars/1/download",
        rating: 48,
        specs: {
          power: "661 HP",
          weight: "1,260 kg",
          acceleration: "3.0s",
          drive: "RWD"
        },
        serverId: server1.id
      });
  
      await this.createCar({
        name: "Nissan Silvia S15",
        category: "JDM",
        imageUrl: "https://pixabay.com/get/g6a8366fac12badce018f40e414ed4a263b331028dc7521e325bfa59c75909610782fc4105ce9be20323e3c4fea5c3312b56e01c62e033d2f02fb90043c634c5b_1280.jpg",
        downloadUrl: "/api/cars/2/download",
        rating: 49,
        specs: {
          power: "250 HP",
          weight: "1,200 kg",
          acceleration: "5.5s",
          drive: "RWD"
        },
        serverId: server2.id
      });
  
      await this.createCar({
        name: "Lamborghini Huracán",
        category: "Supercar",
        imageUrl: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        downloadUrl: "/api/cars/3/download",
        rating: 47,
        specs: {
          power: "640 HP",
          weight: "1,422 kg",
          acceleration: "2.9s",
          drive: "AWD"
        },
        serverId: server1.id
      });
  
      await this.createCar({
        name: "Formula Hybrid 2021",
        category: "F1",
        imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        downloadUrl: "/api/cars/4/download",
        rating: 46,
        specs: {
          power: "1,000 HP",
          weight: "798 kg",
          acceleration: "2.4s",
          drive: "RWD"
        },
        serverId: server1.id
      });
  
      await this.createCar({
        name: "Porsche 911 GT3 RS",
        category: "GT",
        imageUrl: "https://images.unsplash.com/photo-1619525515567-fda50fc02da5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=800",
        downloadUrl: "/api/cars/5/download",
        rating: 50,
        specs: {
          power: "520 HP",
          weight: "1,430 kg",
          acceleration: "3.2s",
          drive: "RWD"
        },
        serverId: server1.id
      });
    }
  }
}

export const storage = new DatabaseStorage();
