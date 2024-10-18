import { prisma } from "../prismaClient.js";
import express from "express";
const router = express.Router();

router.get("/menuRank", async (req, res, next) => {
     try {
          const orderedMenu = await prisma.menu.findMany({
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
               totalSales: menu.orders.length * menu.price,
          }));

          const menusByOrders = [...menus].sort(
               (a, b) => b.totalOrders - a.totalOrders
          );
          const menusBySales = [...menus].sort(
               (a, b) => b.totalSales - a.totalSales
          );

          // 판매량 랭크 계산
          const saleRanks = {};
          let currentSaleRank = 1;

          for (let i = 0; i < menusBySales.length; i++) {
               if (
                    i > 0 &&
                    menusBySales[i].totalSales ===
                         menusBySales[i - 1].totalSales
               ) {
                    saleRanks[menusBySales[i].id] = currentSaleRank; // 같은 매출액에 대해 같은 랭크 부여
               } else {
                    currentSaleRank = i + 1; // 랭크 업데이트
                    saleRanks[menusBySales[i].id] = currentSaleRank;
               }
          }

          // 주문량 랭크 계산
          const orderRanks = {};
          let currentOrderRank = 1;

          for (let i = 0; i < menusByOrders.length; i++) {
               if (
                    i > 0 &&
                    menusByOrders[i].totalOrders ===
                         menusByOrders[i - 1].totalOrders
               ) {
                    orderRanks[menusByOrders[i].id] = currentOrderRank;
               } else {
                    currentOrderRank = i + 1;
                    orderRanks[menusByOrders[i].id] = currentOrderRank;
               }
          }

          // 최종 메뉴 정보에 랭크 추가
          const rankedMenus = menus.map((menu) => ({
               menuId: menu.id,
               nemuName: menu.name,
               price: menu.price,
               totalOrders: menu.totalOrders,
               totalSales: menu.totalSales,
               orderRank: orderRanks[menu.id],
               saleRank: saleRanks[menu.id],
          }));

          //주문량 순으로 정렬

          rankedMenus.sort((a, b) => a.orderRank - b.orderRank);

          res.status(200).json({
               stats: {
                    menus: rankedMenus,
               },
          });
     } catch (error) {
          next(error);
     }
});

export default router;
