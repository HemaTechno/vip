const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const firebase = require('firebase/app');
require('firebase/firestore');

// تكوين Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBF-sE1rBlblyLGpN1m08VnQA-bvfmLvtk",
    authDomain: "public-fcf30.firebaseapp.com",
    projectId: "public-fcf30",
    storageBucket: "public-fcf30.appspot.com",
    messagingSenderId: "4481826675",
    appId: "1:4481826675:web:1663b07dcfc06fec130f06"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// تكوين البوت
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// استماع لإضافة سكربت جديد في Firebase
db.collection('scripts').where('approved', '==', false).onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
            const scriptData = change.doc.data();
            const scriptId = change.doc.id;

            // إرسال الرسالة إلى ديسكورد
            sendScriptToDiscord(scriptId, scriptData.title, scriptData.description, scriptData.youtubeLink);
        }
    });
});

// إرسال السكربت إلى ديسكورد
async function sendScriptToDiscord(scriptId, title, description, youtubeLink) {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`approve_${scriptId}`)
                .setLabel('Approve')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`reject_${scriptId}`)
                .setLabel('Reject')
                .setStyle(ButtonStyle.Danger),
        );

    const webhookUrl = 'https://discord.com/api/webhooks/1157476878114889768/iJ6OmAmYxfjd_NkXgbEDMLxudbYmidxnqsP-uWKcYzOZYaE8wIhvjH_3OTgZwy8lDSNt'; // استبدل بالرابط الخاص بك

    const embed = {
        title: `New Script for Review`,
        description: `Title: ${title}\nDescription: ${description}\nYouTube Link: [Watch Here](${youtubeLink})`,
        color: 0x0099ff
    };

    const messageData = {
        embeds: [embed],
        components: [row]
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            body: JSON.stringify(messageData),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log('Script sent to Discord for review!');
        } else {
            console.error('Failed to send message to Discord.');
        }
    } catch (error) {
        console.error('Error sending message to Discord:', error);
    }
}

// التحكم في الموافقة أو الرفض عبر ديسكورد
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const [action, scriptId] = interaction.customId.split('_');

    if (action === 'approve') {
        // تحديث حالة السكربت في Firebase إلى "approved"
        db.collection('scripts').doc(scriptId).update({ approved: true })
            .then(() => {
                interaction.reply(`Script ${scriptId} has been approved.`);
            })
            .catch(error => {
                console.error('Error approving script:', error);
                interaction.reply('Failed to approve script.');
            });
    } else if (action === 'reject') {
        // حذف السكربت من Firebase
        db.collection('scripts').doc(scriptId).delete()
            .then(() => {
                interaction.reply(`Script ${scriptId} has been rejected.`);
            })
            .catch(error => {
                console.error('Error rejecting script:', error);
                interaction.reply('Failed to reject script.');
            });
    }
});

// تسجيل الدخول إلى البوت
client.login('MTE0NDM5NzY0ODEzMzExMTg2OQ.GGPivS.zQnA_9vxJQcJH9csb9JE5KyZsWIwX7ZqRdSwaE');  // استبدل بالتوكن الخاص بالبوت
