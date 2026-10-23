# 像素小镇

内置 image_gen 生成，同构图日夜地图和透明角色分别存于 public/assets/pixel/。地图不含固定人物。人物、入口和动画由前端渲染。

坐标系：1600×900；像素版行走网格独立定义在 walkableWorld.ts。切换风格时重新挂载场景以重置路线。昼夜切换只更换背景，不重置玩家。

内置装扮分别使用对应的像素素材，由 characterArt.ts 统一映射场景、衣橱和底部头像。玩家自己绘制的角色保留原图，不会被替换成默认小龙。经典版装扮不受影响。学生基地原型尚未接入。

## 生成提示词

### 生日桌

Create a standalone transparent-background game prop: a tiny charming birthday gathering table for a bright cute blue-white dragon pixel-art social game. ONE cohesive compact arrangement in top-down three-quarter RPG perspective, consistent crisp pixel clusters, cheerful cream/cornflower blue/soft pink/gold palette, nearest-neighbor pixel art, no painterly effects. A small low round wooden table covered with a cream cloth with blue triangular edging; a modest two-tier strawberry cake with three lit candles on top. Two small wrapped presents on ground next to table, and a single short stick bearing two blue/pink balloons at left. A small cloth pennant draped along the TABLE FRONT with exact readable text '9·12', organically part of the party prop, not floating UI. Clear clean pixel outlines, subtle 2-tone shading, perfectly matched to the provided cute pixel town reference. No characters, no scenery, no big banner, no frame, no interface card, no text elsewhere, no opaque background, no glow halo. Entire object with comfortable transparent margins, suitable placed beside an open plaza without dominating.

### day

Edit this approved bright cute pixel-art game map. STRICTLY preserve the exact 16:9 composition, camera, all shoreline geometry, island and gazebo positions, stepping-stone path positions, central plaza outline and paving, benches, trees, lower-left discussion table and five stools. This must be an aligned background for a playable game. Remove ALL THREE blue dragon characters (central plaza character AND both seated dragons in lower-left nook), restoring clean paving and EMPTY stools behind them. No characters whatsoever, no text, no UI. Keep clean cheerful blue/cream/apple-green pixel shapes and original level of detail. Keep the original bright daytime lighting and colors. Only remove characters; do not redesign or move anything.

### night

Edit this approved bright cute pixel-art game map. STRICTLY preserve the exact 16:9 composition, camera, all shoreline geometry, island and gazebo positions, stepping-stone path positions, central plaza outline and paving, benches, trees, lower-left discussion table and five stools. This must be an aligned background for a playable game. Remove ALL THREE blue dragon characters (central plaza character AND both seated dragons in lower-left nook), restoring clean paving and EMPTY stools behind them. No characters whatsoever, no text, no UI. Keep clean cheerful blue/cream/apple-green pixel shapes and original level of detail. Change lighting only to a gentle readable night version: deep blue sky with a small crescent moon and a few little pixel stars, indigo-teal lake, subdued blue-green trees, cool light cream moonlit plaza that remains clearly readable and not dark, warm golden lights inside gazebo and small subtle warm glow at existing plaza posts. Maintain the cute friendly tone, no scary mood, no excessive neon, no realistic lighting. Exactly same geometry as reference, no new structures.

### dragon

Create a single isolated small 2D pixel art game character sprite on true transparent background, inspired by the central blue-white dragon in the reference. Full body front three-quarter view, round oversized white face, big blue eyes, branched blue horns, blue cheek fins, small round body wearing white hoodie with blue trim and dark blue shorts and shoes, tiny orange flame at tail to left. Cute cheerful face, stubby limbs, standing neutral pose. Same clean bright cute pixel art as reference, consistently stepped pixel edges, sprite designed at 48x64 pixels and enlarged nearest-neighbor. No scenery, no ground, no drop shadow, no text, no sheet, only ONE character. Preserve transparent alpha.

