import 'dotenv/config'

import { Client } from "discord.js-selfbot-v13"
import { createSpinner } from "nanospinner"
import figlet from "figlet"
import fs from 'fs'
import gradient from "gradient-string"
import readline from 'readline'

let prefix = gradient.morning("Qscraper")

const client = new Client({
        checkUpdate: false,
      })
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function input(prompt) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    return new Promise(resolve => rl.question(prompt, ans => {
        rl.close()
        resolve(ans)
    }))
}

async function shuffle(userArray) {
    for (let i = 0; i < userArray.length - 1; i++) {
        let j = i + Math.floor(Math.random() * (userArray.length - i))
        let temp = userArray[j]
        userArray[j] = userArray[i]
        userArray[i] = temp
    }
    return userArray
}

async function scrape(guild) {
    let spinner = createSpinner(`[${prefix}] Finding users in ${guild.name}...`)
    spinner.start()
    let members =  await shuffle((await (await client.guilds.fetch(guild)).members.fetch({limit: 0})).filter(x => x.user.id !== null && !x.user.bot).map(r => r.user))
    var userjson = []
    let l = members.length
    // for user in list
    var i = 0
    spinner.update({
        text: `[${prefix}]  Found ${l} member(s) in ${guild.name}!`,
    })

    for (i = 0; i < l; i++) {
        sleep(500)
        // update spinner
        spinner.update({
            text: `[${prefix}] Scraping ${i+1}/${l} member(s) from ${guild.name}!\n`
        })

        var roles = []
        let member = members[i].fetch(true)
        member = await member
        let roleslist = member.roles
        // if roleslist is not empty or undefined
        if (roleslist !== undefined) {
            roleslist = roleslist.cache.map(r => r)
            for (let j = 0; j < roleslist.length; j++) {
                roles.push({
                    "id": roleslist[j].id,
                    "name": roleslist[j].name
                }
                )
            }
        }

        // append to json
        let userobjtojson = JSON.stringify(member, null, 2)
        userobjtojson = JSON.parse(userobjtojson)
        // remove useless data
        delete userobjtojson["client"]
        delete userobjtojson["bot"]
        delete userobjtojson["system"]
        delete userobjtojson["defaultAvatarURL"]
        delete userobjtojson["flags"]
        delete userobjtojson["tag"]

        // remove data that is null 
        for (const [key, value] of Object.entries(userobjtojson)) {
            if (value === null) {
                delete userobjtojson[key]
            }
        }

        // add user
        userjson.push(userobjtojson)
}
spinner.update({
    text: `[${prefix}] ${i} user(s) succesfully scraped from ${guild} (${guild.id}).\n`
})
spinner.success()
// save to ./output/${guild}/users.json
fs.writeFileSync(`output\\${guild}-users.json`, JSON.stringify(userjson, null, 2))
process.exit(0)
}

client.on('ready', async() => {
    figlet.text(`Qscraper`, {
        font: 'Small Slant',
        horizontalLayout: 'default',
        verticalLayout: 'default'
    }, async(_err, data) => {
        console.log(gradient.morning.multiline(data))
        //save gradient.morning.multiline(data) to file
        fs.writeFileSync(`temp.txt`, gradient.morning.multiline(data))
        console.log(gradient.morning(`Created by`) + gradient.cristal(` CoronaCarrot\n`))
        console.log(gradient.morning(`----------------------------------------\n`))

        console.log(`  [${prefix}] Logged in as ${client.user.tag}\n`)
        let guild = await input(`  [${prefix}] Enter Guild ID: `)
        console.log(``)
        guild = await client.guilds.fetch(guild)
        scrape(guild)
    })
})



// check if env file doesnt exist
if (!fs.existsSync('./.env')) {
    console.log(`[${prefix}] .env file not found! Creating .env file...`)
    fs.writeFileSync('./.env', `TOKEN=`, (
        err => {
            if (err) {
                console.log(`[${prefix}] Error creating .env file!`)
                process.exit(1)
            }
        }
    ))
    console.log(`[${prefix}] .env file created! Please fill in the .env file with your token...`)
    process.exit(0)
}
// if token is not defined
if (!process.env.TOKEN) {
    console.log(`[${prefix}] Token not found! Please fill in the .env file with your token...`)
    process.exit(0)
}
    
client.login(process.env.TOKEN)