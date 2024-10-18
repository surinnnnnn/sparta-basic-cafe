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

// router.get("/", async (req, res, next) => {
//      const menus = await prisma.menu.findMany({
//           where: { id: true },
//      });
//      res.status(200).json({
//           menus,
//      });
// });

//????
router.get("/:menuId", async (req, res, next) => {
     const id = req.params.menuId;

     console.log(id);

     if (id === undefined || id === "") {
          return res.status(200).json({ message: "메뉴 생성 페이지입니다." });
     }

     if (isNaN(+id)) {
          return res.status(400).json({
               error: "유효하지 않은 메뉴 ID입니다.",
          });
     }

     const menu = await prisma.menu.findUnique({
          where: { id: +id },
     });

     res.status(200).json({ menu });
});

// 메뉴  생성
router.post("/", async (req, res, next) => {
     const { name, type, temperature, price } = req.body;

     const createMenu = await prisma.menu.create({
          data: {
               name: name,
               type: type,
               temperature: temperature,
               price: +price,
          },
     });

     res.status(201).json({
          message: "메뉴 생성되었습니다.",
          menu: {
               createMenu,
          },
     });
});

// 메뉴 수정 하기
router.put("/:menuId", async (req, res, next) => {
     const id = req.params.menuId;
     const { name, type, temperature, price } = req.body;

     const updateMenu = await prisma.Menu.update({
          where: { id: +id },
          data: {
               name: name,
               type: type,
               temperature: temperature,
               price: +price,
          },
     });
     res.status(200).json({
          message: `메뉴 ${id} 수정되었습니다.`,
          data: updateMenu,
     });
});

//메뉴 삭제 하기
router.delete("/:menuId", async (req, res, next) => {
     const id = req.params.menuId;
     const deleteMenu = await prisma.Menu.delete({
          where: { id: +id },
     });

     console.log(deleteMenu);

     res.status(200).json({
          message: `메뉴 ${id} 삭제되었습니다.`,
     });
});

export default router;
