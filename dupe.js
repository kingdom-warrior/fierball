const mineflayer = require('mineflayer');
const { Vec3 } = require('vec3');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.dupe = async function (bot) {
    await delay(10000);
    while (true) {
        try {
            let startTime = Date.now(); // Start time

            console.log("Checking inventory for chest_minecart...");
            let chestMinecarts = bot.inventory.items().filter(item => item.name === "chest_minecart");
            if (chestMinecarts.length >= 8) {
                console.log("Depositing chest_minecarts in storage chest...");
                let storageChest = bot.blockAt(new Vec3(-29952624, 81, -2245995));
                if (storageChest) {
                    let storageContainer = await bot.openContainer(storageChest);
                    for (let i = 0; i < chestMinecarts.length; i++) {
                        await storageContainer.deposit(chestMinecarts[i].type, null, chestMinecarts[i].count);
                        if ((i + 1) % 6 === 0) {
                            await delay(400);
                        }
                    }
                    storageContainer.close();
                    await delay(400);
                }
            }

            console.log("Step 1: Pressing the first button...");
            let buttonBlock1 = bot.blockAt(new Vec3(-29952625, 80, -2245994));
            if (buttonBlock1) {
                await bot.activateBlock(buttonBlock1);
                await delay(700);
            }

            console.log("Step 2: Looking for nearest chest_minecart within a 2x2x2 area...");
            let entity = bot.nearestEntity(entity => 
                entity.name === 'chest_minecart' &&
                Math.abs(entity.position.x - bot.entity.position.x) <= 1 &&
                Math.abs(entity.position.y - bot.entity.position.y) <= 1 &&
                Math.abs(entity.position.z - bot.entity.position.z) <= 1
            );

            if (entity) {
                let container = await bot.openContainer(entity);
                console.log("Chest minecart opened. Depositing all shulker boxes...");

                try {
                    let shulkerItems = bot.inventory.items().filter(item => item.name.includes("shulker_box"));
                    for (let i = 0; i < shulkerItems.length; i++) {
                        await container.deposit(shulkerItems[i].type, null, shulkerItems[i].count);
                        if ((i + 1) % 6 === 0) {
                            await delay(400);
                        }
                    }
                } catch (error) {
                    if (error.message.includes("destination full")) {
                        console.warn("Destination full! Moving to Step 3.");
                    } else {
                        throw error;
                    }
                }

                container.close();
                await delay(200);
            } else {
                console.warn("No chest_minecart found within the 2x2x2 area.");
            }

            console.log("Step 3: Pressing the second button...");
            let buttonBlock2 = bot.blockAt(new Vec3(-29952626, 80, -2245997));
            if (buttonBlock2) {
                await bot.activateBlock(buttonBlock2);
                await delay(200);
            }

            let endTime = Date.now(); // End time
            console.log(`Duplication process completed! Time taken: ${(endTime - startTime) / 1000} seconds`);
            
            await delay(200);

        } catch (error) {
            console.error("Error executing dupe function:", error);
        }
    }
};
