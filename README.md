# 乘法

给一年级、二年级小朋友用的九九乘法表。可以看口诀、做练习、闯关收集星星。

不需要账号，没有广告，也没有统计。练习记录只保存在这台设备的浏览器里，第一次打开之后，断网也能用。

线上地址：[https://fymdchenwei.github.io/chengfa/](https://fymdchenwei.github.io/chengfa/)

## 本地运行

需要 Node.js 20 或更新版本。

```bash
npm install
npm run dev
```

浏览器打开 [http://127.0.0.1:43217/chengfa/](http://127.0.0.1:43217/chengfa/)。

## 测试

```bash
npm test
```

测试覆盖口诀、选择题干扰项，以及答错后重新排队的复习逻辑。

## 构建

```bash
npm run build
npm run preview
```

网站文件在 `dist` 目录。`npm run preview` 会在本机用构建结果开一个页面，适合检查离线是否生效：先打开一次，再断开网络，刷新后仍然可以学习和做题。

## 添加到 iPhone / iPad 主屏幕

1. 把网站放到一个 **HTTPS** 网址上。手机 Safari 不能把「只在自己电脑上的 localhost」装成可用的离线应用。
2. 用 iPhone 或 iPad 的 **Safari** 打开这个网址。
3. 点底部分享按钮（方框加上箭头）。
4. 向下滑动，点 **添加到主屏幕**。
5. 名字保持「乘法」，点 **添加**。
6. 回到主屏幕，点「乘法」图标。第一次需要联网；打开过之后，没有网络也可以练习。

如果主屏幕上已经有旧图标，iPhone 和 iPad 不会自动换成新的。请先按住旧的「乘法」图标删掉，再用 Safari 按上面的步骤重新添加一次。

安卓可以用浏览器菜单里的「安装应用」或「添加到主屏幕」。已经装过的话，如果图标还是旧的，先卸载再重新安装。

## 静态部署

`dist` 可以直接放到 Netlify、Cloudflare Pages、GitHub Pages，或任何静态网站目录。站点需要通过 HTTPS 访问，手机才能安装，服务工作线程也才能在离线时接管页面。

页面地址写在 `#` 后面，例如 `/chengfa/#/learn`。服务器不用额外配置「把所有路径都交回 index.html」。

这个仓库按子路径 `/chengfa/` 构建：Vite 的 `base` 是 `/chengfa/`，应用清单的 `start_url` 和 `scope` 也是 `/chengfa/`，服务工作线程注册在 `/chengfa/sw.js`，作用域同样是 `/chengfa/`。推送到 `main` 后，GitHub Actions（`.github/workflows/pages.yml`）会用官方 Pages 动作构建并发布到 [https://fymdchenwei.github.io/chengfa/](https://fymdchenwei.github.io/chengfa/)。Pages 的来源需要设为 **GitHub Actions**。

## 说明

- 学习：点一行口诀，看 `3 × 4 = 12`，旁边是传统口诀「三四十二」。点喇叭会把口诀读成一拍一拍的短语，例如「三四，十二」。
- 练习：选 1 到 9 的某一行，或混合。可以看四个选项，也可以自己填得数。答错的题目会隔一两题再出现，同一道题最多再练两次。
- 闯关：先过 1 到 9，再混合，最后是 60 秒挑战。拿到至少 1 颗星才打开下一关。星星只增不减。
- 进步：九九表上能看到每道题是还没练、正在学、越来越熟，还是掌握了。连续答对 4 次算掌握；再错一次会降下来，方便回头复习。
- 进度存在 `localStorage`，键名是 `chengfa-progress-v1`。清除浏览器里这个网站的数据，星星和练习记录会一起消失。应用里的「清空进度」也一样。
- 朗读和音效都可以在「我的」页关掉。声音和语速在「语音设置」里调：从这台设备已有的中文语音里挑一个，语速从 0.5 到 1.5，旁边可以「试听一下」。朗读用浏览器自带的 `speechSynthesis`，不联网，也不接外部语音服务，也不下载字体。好不好听，取决于这台设备有没有中文语音。应用会优先挑更自然的普通话，例如 iPhone 上的 Tingting，或安卓上的「Google 普通话」；也会认 Meijia、Sinji。没有这些名字时，就用设备里其他中文语音。完全没有中文语音时，只能看字。选择保存在这台设备上。
