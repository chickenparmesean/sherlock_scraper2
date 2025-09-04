# 🚀 Team Deployment Guide - Sherlock Figma Plugin

## ✅ Status: Ready for Production

Your Sherlock Plugin system is fully configured and ready for team deployment!

## 📡 Step 1: Deploy Your API Server

### Deploy to Replit Production
1. **In this Replit project**: Click "Deploy" in the top header
2. **Choose "Autoscale"** deployment type  
3. **Deployment settings**:
   - Build Command: *(leave empty)*
   - Run Command: `node sherlock-figma-integration/api-server/server.js`
   - Machine: Default (1 vCPU, 2 GiB RAM)
4. **Environment Variables**: Ensure `GITHUB_TOKEN` is set
5. **Click "Deploy"** 

✅ **You'll get a production URL like**: `https://your-project-name.replit.app`

## 🔧 Step 2: Update Plugin with Your Production URL

1. **Copy your deployment URL** from Replit (e.g., `https://your-project-name.replit.app`)
2. **In the plugin file `figma-plugin/src/ui.html`**:
   - Find: `'https://YOUR-PROJECT-NAME.replit.app'`
   - Replace with your actual URL: `'https://your-actual-deployment.replit.app'`
   - **Replace ALL 3 instances** (there are multiple locations)

## 📦 Step 3: Package Plugin for Your Team  

### Files to Share with Team:
```
📁 sherlock-figma-plugin/
   ├── 📄 manifest.json
   ├── 📄 src/code.js  
   └── 📄 src/ui.html
```

## 🎨 Step 4: Team Installation Instructions

### For Team Members (Works on Mac, Windows, Browser):

1. **Download** the 3 plugin files from you
2. **Open Figma** (browser or desktop app)
3. **Go to**: Plugins → Development → Import plugin from manifest
4. **Select**: `manifest.json` file
5. **Done!** Plugin appears as "Auditor Slide Generator" in their Plugins menu

### Plugin Features Your Team Gets:
- ✅ **Automated auditor data** from Sherlock URLs
- ✅ **82+ protocol logos** with upload capability  
- ✅ **15+ auditor signatures** database
- ✅ **Smart text population** for all slide elements
- ✅ **Profile image replacement** 
- ✅ **Custom content fields** for manual input

## 🎯 Template Requirements for Team

Tell your team their slide templates need these **exact element names**:

### Required Text Elements:
- `auditor-name` - Auditor's name
- `achievement-1` - Contest rankings (auto-generated)
- `achievement-2` - Total earnings (auto-generated) 
- `achievement-3` - Vulnerability stats (auto-generated)
- `subtitle2` - "Why [auditor] is good fit for [protocol]" (auto-generated)

### Required Image Elements:  
- `profilepicture` - Gets auditor's profile image
- `signature` - Gets auditor's signature (optional)
- `frame1`, `frame2`, `frame3` - Logo containers (auto-populated)

### Optional Elements:
- `achievement-4`, `goodfit-1`, `goodfit-2`, `goodfit-3` - Custom content
- `subheading`, `description` - Manual auditor details

## 🔄 How Team Uses the Plugin

1. **Create slide template** with proper element naming
2. **Open plugin** ("Auditor Slide Generator" in Plugins menu)
3. **Enter Sherlock URL**: `https://audits.sherlock.xyz/watson/USERNAME`
4. **Enter protocol name**: e.g., "Compound" 
5. **Select logos** from dropdown (82+ available)
6. **Select signature** from dropdown (15+ available)
7. **Add custom content** in manual fields
8. **Click "Generate Slide"** - Done! ✨

## 🌐 Cross-Platform Compatibility

✅ **Figma Web Browser** (Chrome, Safari, Firefox, Edge)  
✅ **Figma Desktop App** (Mac & Windows)  
✅ **All team members** get identical experience

## 🛠️ System Architecture

- **API Backend**: Your deployed Replit server
- **Data Sources**: Sherlock Protocol + GitHub logo/signature repos
- **Plugin**: Pure JavaScript (no external dependencies)
- **Team Access**: Import development plugin (no approval needed)

## 📞 Need Help?

- **API Issues**: Check your Replit deployment logs
- **Plugin Issues**: Verify template element naming matches requirements  
- **Missing Data**: Logos/signatures managed via GitHub repository

---

## 🎉 Ready to Deploy!

Your system is production-ready. Share the plugin files and this guide with your team for instant access to professional auditor slide generation!