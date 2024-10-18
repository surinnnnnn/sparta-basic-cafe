import { prisma } from "../prismaClient.js";
import express from "express";
const router = express.Router();

router.get("/stats", async (req, res, next) => {
     const totalMenus = await prisma.Menu.aggregate({
          _count: {
               id: true,
          },
     });

     const totalOrders = await prisma.OrderHistory.aggregate({
          _count: {
               id: true,
          },
     });

     // 메뉴랑 오더랑 조인

     const orderedMenu = await prisma.Menu.findMany({
          include: {
               orders: true,
          },
     });

     const totalSales = orderedMenu.reduce((total, menu) => {
          const orderCount = menu.orders.length;
          return total + orderCount * menu.price;
     }, 0);

     res.status(200).json({
          stats: {
               totalMenus: totalMenus._count.id,
               totalOrders: totalOrders._count.id,
               totalSales: totalSales,
          },
     });
});

router.get("/", async (req, res, next) => {
     const orderedMenu = await prisma.Menu.findMany({
          include: {
               orders: true,
          },
     });

     const menus = orderedMenu.map((menu) => ({
          id: menu.id,
          name: menu.name,
          type: menu.type,
          temperature: menu.temperature,
          price: menu.price,
          totalOrders: menu.orders.length,
     }));

     res.status(200).json({
          menus,
     });
});

export default router;
