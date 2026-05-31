// generate-dict.js - 智能词库生成器
// 基于已有词根，通过英语构词法（前缀+后缀）生成9000词
const fs = require('fs');
const path = require('path');

// 1. 从 gen-words.js 提取已有词汇
const genSrc = fs.readFileSync(path.join(__dirname, 'gen-words.js'), 'utf8');
const rootWords = [];
const re = /A\("([^"]+)"\)/g;
let m;
while ((m = re.exec(genSrc)) !== null) {
  const [w, p, pos, def] = m[1].split('|');
  rootWords.push({ word: w, phonetic: p, pos, def });
}
console.log('Root words loaded:', rootWords.length);

// 2. 内嵌大量额外核心词汇（B-Z开头，常见TOEFL/SAT/GRE/日常词汇）
const extraCore = `
baby|n.|婴儿 back|n./v.|背部；支持 backward|adj./adv.|向后的
bacon|n.|培根 bacteria|n.|细菌 bad|adj.|坏的 badge|n.|徽章
badly|adv.|严重地 bag|n.|包 baggage|n.|行李 bail|n./v.|保释
bait|n./v.|诱饵 bake|v.|烘焙 bakery|n.|面包店
balance|n./v.|平衡 balcony|n.|阳台 bald|adj.|秃头的
ball|n.|球 ballad|n.|民谣 ballet|n.|芭蕾舞 balloon|n.|气球
ballot|n./v.|投票 bamboo|n.|竹子 ban|v./n.|禁止
banana|n.|香蕉 band|n.|乐队 bandage|n./v.|绷带
bang|n./v.|猛击 banish|v.|放逐 bank|n./v.|银行
banker|n.|银行家 bankrupt|adj./n.|破产的 banner|n.|旗帜
banquet|n.|宴会 bar|n./v.|酒吧；阻止 barb|n.|倒刺
bare|adj./v.|赤裸的；暴露 barely|adv.|几乎不
bargain|n./v.|便宜货；讨价还价 bark|v./n.|吠叫；树皮
barn|n.|谷仓 baron|n.|男爵；大亨 barrel|n.|桶
barren|adj.|贫瘠的 barrier|n.|障碍 barter|v./n.|以物易物
base|n./v./adj.|基础；卑鄙的 baseball|n.|棒球
basement|n.|地下室 basic|adj.|基本的 basin|n.|盆地
basis|n.|基础 basket|n.|篮子 bat|n.|蝙蝠；球棒
batch|n.|一批 bath|n.|洗澡 bathe|v.|沐浴
battery|n.|电池 battle|n./v.|战斗 bay|n.|海湾
be|v.|是 beach|n.|海滩 beacon|n.|灯塔
bead|n.|珠子 beak|n.|鸟嘴 beam|n./v.|梁；微笑
bean|n.|豆子 bear|v./n.|承受；熊 beard|n.|胡须
beast|n.|野兽 beat|v./n.|打；节拍 beautiful|adj.|美丽的
beauty|n.|美丽 because|conj.|因为 become|v.|成为
bed|n.|床 beef|n.|牛肉 beer|n.|啤酒
beetle|n.|甲虫 before|prep./conj.|在…之前 beg|v.|乞求
begin|v.|开始 behalf|n.|代表 behave|v.|表现
behavior|n.|行为 behind|prep.|在…后面 being|n.|存在；生物
belief|n.|信念 believe|v.|相信 bell|n.|钟；铃
belly|n.|腹部 belong|v.|属于 beloved|adj.|心爱的
below|prep./adv.|在…下方 belt|n.|腰带 bench|n.|长凳
bend|v./n.|弯曲 beneath|prep.|在…下方 benefit|n./v.|利益
benevolent|adj.|仁慈的 benign|adj.|良性的 bent|adj./n.|弯曲的
berry|n.|浆果 beside|prep.|在…旁边 besides|prep./adv.|除…之外
best|adj./adv.|最好的 bet|v./n.|打赌 betray|v.|背叛
better|adj./adv.|更好的 between|prep.|在…之间 beverage|n.|饮料
beware|v.|当心 beyond|prep./adv.|超出 bias|n./v.|偏见
bible|n.|圣经 bicycle|n.|自行车 bid|v./n.|出价
big|adj.|大的 bill|n./v.|账单 billion|n.|十亿
bin|n.|箱子 bind|v.|捆绑 biography|n.|传记
biology|n.|生物学 bird|n.|鸟 birth|n.|出生
birthday|n.|生日 biscuit|n.|饼干 bishop|n.|主教
bit|n.|一点 bite|v./n.|咬 bitter|adj.|苦的；痛苦的
bizarre|adj.|奇异的 black|adj./n.|黑色的 blame|v./n.|责备
bland|adj.|乏味的 blank|adj./n.|空白的 blanket|n.|毯子
blast|n./v.|爆炸 blaze|n./v.|火焰 bleak|adj.|荒凉的
bleed|v.|流血 blend|v./n.|混合 bless|v.|祝福
blind|adj./v.|盲的 blink|v./n.|眨眼 bliss|n.|极乐
blizzard|n.|暴风雪 block|n./v.|街区；阻塞 blood|n.|血液
bloom|v./n.|开花 blossom|v./n.|开花 blot|n./v.|污点
blow|v./n.|吹；打击 blue|adj./n.|蓝色的 bluff|v./n.|虚张声势
blunder|n./v.|大错 blunt|adj./v.|钝的；坦率的
blur|v./n.|模糊 blurt|v.|脱口而出 blush|v./n.|脸红
board|n./v.|木板；上船 boast|v./n.|吹嘘 boat|n.|船
body|n.|身体 boil|v./n.|煮沸 bold|adj.|大胆的
bolt|n./v.|螺栓；逃跑 bomb|n./v.|炸弹 bond|n./v.|纽带
bone|n.|骨头 bonus|n.|奖金 book|n./v.|书；预订
boom|n./v.|繁荣 boost|v./n.|促进 boot|n.|靴子
border|n./v.|边界 bore|v./n.|使厌烦 boredom|n.|无聊
born|adj.|天生的 borrow|v.|借入 boss|n./v.|老板
botany|n.|植物学 both|adj./pron.|两者都 bother|v./n.|打扰
bottle|n./v.|瓶子 bottom|n./adj.|底部 boulder|n.|巨石
bounce|v./n.|弹跳 bound|v./adj./n.|跳跃；一定的 boundary|n.|边界
bounty|n.|赏金 bout|n.|一回 bow|v./n.|鞠躬；弓
bowl|n.|碗 box|n./v.|盒子；拳击 boycott|v./n.|抵制
boy|n.|男孩 brace|v./n.|支撑 bracket|n.|括号
brain|n.|大脑 brake|n./v.|刹车 branch|n./v.|分支
brand|n./v.|品牌 brass|n.|黄铜 brave|adj./v.|勇敢的
breach|n./v.|违反；缺口 bread|n.|面包 breadth|n.|宽度
break|v./n.|打破 breakdown|n.|崩溃 breakthrough|n.|突破
breath|n.|呼吸 breathe|v.|呼吸 breed|v./n.|繁殖；品种
breeze|n.|微风 brevity|n.|简洁 brew|v./n.|酿造
bribe|v./n.|贿赂 brick|n.|砖 bride|n.|新娘
bridge|n./v.|桥梁 brief|adj./v./n.|简短的；简报
bright|adj.|明亮的 brilliant|adj.|辉煌的 bring|v.|带来
brink|n.|边缘 brisk|adj.|轻快的 brittle|adj.|脆的
broad|adj.|宽阔的 broadcast|v./n.|广播 broaden|v.|扩大
bronze|n./adj.|青铜 brook|n./v.|小溪；容忍
brother|n.|兄弟 brown|adj./n.|棕色的 browse|v.|浏览
bruise|n./v.|瘀伤 brush|n./v.|刷子 brutal|adj.|残忍的
bubble|n./v.|泡泡 bucket|n.|桶 budget|n./v.|预算
buffalo|n.|水牛 buffer|n./v.|缓冲 buffet|n.|自助餐
bug|n./v.|虫子；窃听 build|v./n.|建造 building|n.|建筑
bulb|n.|灯泡 bulk|n./adj.|大量；体积 bull|n.|公牛
bullet|n.|子弹 bulletin|n.|公报 bully|v./n.|欺负
bump|v./n.|碰撞 bunch|n./v.|一束；聚集 bundle|n./v.|捆
burden|n./v.|负担 bureau|n.|局；办公室 bureaucracy|n.|官僚主义
burial|n.|埋葬 burn|v./n.|燃烧 burst|v./n.|爆裂
bury|v.|埋葬 bus|n.|公共汽车 bush|n.|灌木
business|n.|商业；事务 busy|adj.|忙碌的 but|conj./prep.|但是
butter|n./v.|黄油 butter|n.|蝴蝶 button|n./v.|按钮
buy|v./n.|购买 buzz|v./n.|嗡嗡声
cabin|n.|小屋 cabinet|n.|橱柜；内阁 cable|n./v.|电缆；电缆
cafe|n.|咖啡馆 cage|n./v.|笼子 cake|n.|蛋糕
calcium|n.|钙 calculate|v.|计算 calculation|n.|计算
calendar|n.|日历 calf|n.|小牛 call|v./n.|打电话；呼叫
calm|adj./v./n.|平静的；使平静 calorie|n.|卡路里
camel|n.|骆驼 camera|n.|相机 camp|n./v.|营地；露营
campaign|n./v.|运动；战役 campus|n.|校园
can|v.|能；可以 canal|n.|运河 cancel|v.|取消
cancer|n.|癌症 candid|adj.|坦率的 candidate|n.|候选人
candle|n.|蜡烛 candy|n.|糖果 cannon|n.|大炮
canoe|n.|独木舟 canopy|n.|天篷 canvas|n.|帆布
cap|n./v.|帽子；覆盖 capable|adj.|有能力的
capacity|n.|容量；能力 capital|n./adj.|首都；资本的
capitulate|v.|投降 capsule|n.|胶囊 captain|n.|队长；船长
caption|n.|标题；说明 captive|n./adj.|俘虏；被俘的
capture|v./n.|捕获 car|n.|汽车 carbon|n.|碳
card|n.|卡片 cardinal|adj./n.|主要的；红衣主教
career|n.|职业 cargo|n.|货物 caring|adj.|关心他人的
carnival|n.|嘉年华 carpet|n.|地毯 carriage|n.|马车
carrier|n.|运输工具；载体 carrot|n.|胡萝卜 carry|v.|搬运
cart|n./v.|手推车 cartilage|n.|软骨 carve|v.|雕刻
cascade|n./v.|瀑布；级联 case|n.|情况；案件
cash|n./v.|现金 castle|n.|城堡 casual|adj.|随意的
casualty|n.|伤亡人员 cat|n.|猫 catalog|n./v.|目录
catalyst|n.|催化剂 catastrophe|n.|大灾难 catch|v./n.|抓住
category|n.|类别 cater|v.|迎合；提供 cathedral|n.|大教堂
cattle|n.|牛 caught|v.|catch过去式 cause|n./v.|原因；引起
caution|n./v.|谨慎；警告 cautious|adj.|谨慎的
cavalry|n.|骑兵 cave|n./v.|洞穴 cease|v./n.|停止
ceiling|n.|天花板 celebrate|v.|庆祝 celebration|n.|庆祝
celebrity|n.|名人 cell|n.|细胞；牢房 cellar|n.|地窖
cement|n./v.|水泥；粘合 cemetery|n.|墓地
censor|v./n.|审查 censorship|n.|审查制度
census|n.|人口普查 center|n./v.|中心 central|adj.|中央的
century|n.|世纪 cereal|n.|谷物 ceremony|n.|典礼
certain|adj.|确定的 certainly|adv.|当然 certificate|n.|证书
chain|n./v.|链；链接 chair|n./v.|椅子；主持
chairman|n.|主席 chalk|n.|粉笔 challenge|n./v.|挑战
chamber|n.|房间；议院 champion|n.|冠军 championship|n.|锦标赛
chance|n./v./adj.|机会；偶然 chancellor|n.|总理
change|n./v.|改变 channel|n./v.|渠道；频道 chaos|n.|混乱
chaotic|adj.|混乱的 chapel|n.|小教堂 chapter|n.|章；回
character|n.|性格；角色 characteristic|n./adj.|特征
characterize|v.|以…为特征 charge|n./v.|费用；指控；充电
charity|n.|慈善 charm|n./v.|魅力；迷住 chart|n./v.|图表
charter|n./v.|宪章；包租 chase|v./n.|追赶
cheap|adj.|便宜的 cheat|v./n.|欺骗 check|v./n.|检查
cheek|n.|脸颊 cheer|v./n.|欢呼 cheese|n.|奶酪
chef|n.|厨师 chemical|adj./n.|化学的；化学品
chemistry|n.|化学 cherry|n.|樱桃 chess|n.|国际象棋
chest|n.|胸部；箱子 chew|v./n.|咀嚼 chicken|n.|鸡
chief|n./adj.|首领；主要的 child|n.|孩子 childhood|n.|童年
chill|n./v./adj.|寒冷 chill|adj.|寒冷的
chimney|n.|烟囱 chin|n.|下巴 chip|n./v.|碎片；削
chocolate|n.|巧克力 choice|n./adj.|选择 choke|v./n.|窒息
choose|v.|选择 chop|v./n.|砍；排骨 chord|n.|和弦
chore|n.|杂务 chorus|n.|合唱团 chose|v.|choose过去式
chosen|adj./v.|被选中的 Christian|n./adj.|基督徒
chronic|adj.|慢性的；长期的 chronicle|n./v.|编年史
chuck|v./n.|扔；放弃 chunk|n.|大块 church|n.|教堂
cigar|n.|雪茄 cigarette|n.|香烟 circle|n./v.|圆；环绕
circuit|n.|电路；巡回 circular|adj.|圆形的 circulate|v.|循环
circumstance|n.|情况 circumstance|n.|环境 citizen|n.|公民
citizenship|n.|公民身份 citrus|n.|柑橘 civic|adj.|城市的
civil|adj.|公民的；文明的 civilization|n.|文明
civilize|v.|使文明 claim|n./v.|声称；要求
clamor|n./v.|喧闹 clamp|n./v.|夹子；夹紧
clan|n.|氏族 clap|v./n.|鼓掌 clarify|v.|澄清
clarity|n.|清晰 clash|n./v.|冲突 clasp|n./v.|紧握
class|n.|班级；阶级 classic|adj./n.|经典的；经典
classical|adj.|古典的 classification|n.|分类
classify|v.|分类 clause|n.|条款；从句 clay|n.|黏土
clean|adj./v.|干净的；打扫 clearly|adv.|清楚地
clement|adj.|温和的 clergy|n.|神职人员 clerk|n.|职员
clever|adj.|聪明的 click|n./v.|点击 client|n.|客户
cliff|n.|悬崖 climate|n.|气候 climax|n.|高潮
climb|v./n.|攀登 cling|v.|紧贴；坚持 clinic|n.|诊所
clinical|adj.|临床的 clip|n./v.|夹子；修剪 cloak|n./v.|斗篷；掩盖
clock|n.|钟 close|v./adj./adv.|关闭；近的 closet|n./adj.|壁橱
closure|n.|关闭 cloth|n.|布 clothe|v.|给…穿衣
clothes|n.|衣服 clothing|n.|服装 cloud|n./v.|云；使阴暗
cloudy|adj.|多云的 clown|n.|小丑 club|n./v.|俱乐部
clue|n.|线索 clump|n./v.|丛；聚集 cluster|n./v.|簇；聚集
clutch|v./n.|抓紧；离合器 coach|n./v.|教练；辅导
coal|n.|煤 coalition|n.|联盟 coast|n./v.|海岸
coat|n./v.|外套；涂 coax|v.|哄骗 cobalt|n.|钴
cockpit|n.|驾驶舱 coconut|n.|椰子 code|n./v.|代码；编码
coerce|v.|强迫 coercion|n.|强迫 coercive|adj.|强制的
coexist|v.|共存 coffee|n.|咖啡 coffin|n.|棺材
cognition|n.|认知 cognitive|adj.|认知的 coherent|adj.|连贯的
cohesion|n.|凝聚力 cohesive|adj.|有凝聚力的 coil|n./v.|线圈；盘绕
coin|n./v.|硬币；铸造 coincide|v.|巧合；一致
coincidence|n.|巧合 cold|adj./n.|寒冷的；感冒
collaborate|v.|合作 collaboration|n.|合作 collapse|v./n.|倒塌
collar|n.|衣领 collateral|n./adj.|抵押品 colleague|n.|同事
collect|v.|收集 collection|n.|收藏 collective|adj./n.|集体的
college|n.|大学 collide|v.|碰撞 collision|n.|碰撞
colloquial|adj.|口语的 colon|n.|冒号；结肠 colonel|n.|上校
colonial|adj.|殖民的 colony|n.|殖民地 color|n./v.|颜色
colossal|adj.|巨大的 column|n.|柱；专栏 combat|n./v.|战斗
combination|n.|结合 combine|v./n.|结合 come|v.|来
comedy|n.|喜剧 comet|n.|彗星 comfort|n./v.|安慰；舒适
comfortable|adj.|舒适的 comic|adj./n.|滑稽的；漫画
command|v./n.|命令 commander|n.|指挥官 commemorate|v.|纪念
commence|v.|开始 commend|v.|推荐；称赞 comment|n./v.|评论
commerce|n.|商业 commercial|adj./n.|商业的；广告
commission|n./v.|委员会；委托 commit|v.|犯（罪）；承诺
commitment|n.|承诺；投入 committee|n.|委员会
commodity|n.|商品 common|adj.|常见的；共同的
commonly|adv.|通常 commonwealth|n.|联邦 communal|adj.|公共的
commune|v./n.|交流；公社 communicate|v.|交流
communication|n.|交流 communism|n.|共产主义
community|n.|社区 commute|v./n.|通勤 compact|adj./n./v.|紧凑的
companion|n.|同伴 company|n.|公司；陪伴 comparable|adj.|可比较的
comparative|adj.|比较的 compare|v./n.|比较 comparison|n.|比较
compartment|n.|隔间 compassion|n.|同情 compassionate|adj.|有同情心的
compatible|adj.|兼容的 compel|v.|强迫 compelling|adj.|引人注目的
compensate|v.|补偿 compensation|n.|补偿 compete|v.|竞争
competence|n.|能力 competent|adj.|有能力的 competition|n.|竞争
competitive|adj.|竞争的 competitor|n.|竞争者 compile|v.|编译；汇编
complacent|adj.|自满的 complain|v.|抱怨 complaint|n.|抱怨
complement|n./v.|补充 complete|adj./v.|完整的；完成
complex|adj./n.|复杂的；综合体 complexion|n.|肤色
complexity|n.|复杂性 compliance|n.|合规 compliant|adj.|顺从的
complicate|v.|使复杂化 complication|n.|并发症 compliment|n./v.|赞美
comply|v.|遵从 component|n./adj.|成分 compose|v.|组成；作曲
composer|n.|作曲家 composite|adj./n.|复合的 composition|n.|作文；作曲
compost|n./v.|堆肥 composure|n.|镇定 compound|n./v./adj.|化合物
comprehend|v.|理解 comprehension|n.|理解 comprehensive|adj.|全面的
compress|v./n.|压缩 comprise|v.|包含 compromise|n./v.|妥协
compulsory|adj.|强制的 computation|n.|计算 compute|v.|计算
computer|n.|计算机 conceal|v.|隐藏 concede|v.|承认；让步
conceit|n.|自负 conceive|v.|构想；怀孕 concentrate|v.|集中
concentration|n.|集中；浓度 concept|n.|概念 conception|n.|构想
concern|n./v.|关心；涉及 concert|n.|音乐会 concession|n.|让步
concise|adj.|简洁的 conclude|v.|得出结论 conclusion|n.|结论
conclusive|adj.|决定性的 concrete|adj./n.|具体的；混凝土
concur|v.|同时发生；同意 concurrent|adj.|同时发生的
condemn|v.|谴责 condensation|n.|凝结 condense|v.|凝结；浓缩
condescend|v.|屈尊 condiment|n.|调味品 condition|n./v.|条件
conditional|adj.|有条件的 conduct|v./n.|进行；行为 conductor|n.|指挥；导体
cone|n.|圆锥 confer|v.|授予；协商 conference|n.|会议
confess|v.|承认；坦白 confession|n.|坦白 confide|v.|倾诉
confidence|n.|信心 confident|adj.|自信的 confidential|adj.|机密的
confine|v./n.|限制；范围 confirm|v.|确认 confirmation|n.|确认
confiscate|v.|没收 conflict|n./v.|冲突 conform|v.|符合；遵守
conformity|n.|一致 confront|v.|面对 confrontation|n.|对抗
confuse|v.|使困惑 confusion|n.|困惑 congratulate|v.|祝贺
congregate|v.|聚集 congregation|n.|集会 congress|n.|国会
conjunction|n.|连接词；结合 connect|v.|连接 connection|n.|连接
conquer|v.|征服 conquest|n.|征服 conscience|n.|良心
conscientious|adj.|认真的 conscious|adj.|有意识的 consciousness|n.|意识
consecutive|adj.|连续的 consensus|n.|共识 consent|n./v.|同意
consequence|n.|结果 consequently|adv.|因此
conservation|n.|保护；节约 conservatism|n.|保守主义
conservative|adj./n.|保守的 conserve|v.|保存；节约
consider|v.|考虑 considerable|adj.|相当大的
considerate|adj.|体贴的 consideration|n.|考虑
consist|v.|由…组成 consistent|adj.|一致的 console|v./n.|安慰；控制台
consolidate|v.|巩固 conspicuous|adj.|显眼的 conspiracy|n.|阴谋
conspire|v.|密谋 constant|adj./n.|不变的；常数
constellation|n.|星座 constituency|n.|选区
constitute|v.|构成 constitution|n.|宪法；体质
constitutional|adj.|宪法的 constrain|v.|限制 constraint|n.|限制
constrict|v.|压缩 construct|v./n.|建造 construction|n.|建筑
constructive|adj.|建设性的 consul|n.|领事 consult|v.|咨询
consultant|n.|顾问 consume|v.|消费 consumer|n.|消费者
consumption|n.|消费；消耗 consummate|adj./v.|完美的；完成
contact|n./v.|接触；联系 contain|v.|包含 container|n.|容器
contaminate|v.|污染 contamination|n.|污染
contemplate|v.|沉思；凝视 contemplation|n.|沉思
contemporary|adj./n.|当代的；同时代人 contempt|n.|轻蔑
contend|v.|竞争；主张 content|n./adj./v.|内容；满足的
contest|n./v.|竞赛；争夺 context|n.|背景；语境
continent|n.|大陆 contingent|adj./n.|视情况而定的
continual|adj.|不断的 continue|v.|继续 continuity|n.|连续性
continuous|adj.|连续的 contour|n.|轮廓 contraband|n./adj.|走私品
contract|n./v.|合同；收缩 contractor|n.|承包商
contradict|v.|反驳 contradiction|n.|矛盾 contrary|adj./n.|相反的
contrast|n./v.|对比 contribute|v.|贡献 contribution|n.|贡献
controversial|adj.|有争议的 controversy|n.|争论
convene|v.|召集 convenient|adj.|方便的 convention|n.|大会；惯例
conventional|adj.|传统的 converge|v.|汇聚 conversation|n.|对话
conversion|n.|转换 convert|v./n.|转换；改变 convey|v.|传达；运输
convict|v./n.|定罪；罪犯 conviction|n.|定罪；信念
convince|v.|使确信 convincing|adj.|令人信服的
convoy|n./v.|护送 cooperate|v.|合作 cooperation|n.|合作
cooperative|adj./n.|合作的 coordinate|v./n./adj.|协调
cope|v.|应付 copper|n./adj.|铜 cord|n.|绳索 core|n./adj.|核心
cork|n./v.|软木塞 corn|n.|玉米 corner|n./v.|角落
cornet|n.|短号 corona|n.|日冕 corporal|n./adj.|下士；身体的
corporate|adj.|公司的 corporation|n.|公司 corps|n.|军团
corpse|n.|尸体 correct|adj./v.|正确的；纠正 correction|n.|纠正
correlate|v./n.|关联 correlation|n.|相关 correspond|v.|相符
correspondence|n.|信件；一致 correspondent|n.|记者
corresponding|adj.|相应的 corridor|n.|走廊 corroborate|v.|证实
corrode|v.|腐蚀 corrosion|n.|腐蚀 corrupt|adj./v.|腐败的
corruption|n.|腐败 cosmetic|n./adj.|化妆品 cosmos|n.|宇宙
cost|n./v.|费用；花费 costly|adj.|昂贵的
costume|n.|服装 cottage|n.|小屋 cotton|n.|棉花
couch|n./v.|沙发；表达 cough|v./n.|咳嗽 could|v.|能够
council|n.|委员会 counsel|n./v.|忠告；律师
counselor|n.|顾问 count|v./n.|计算；重要 countless|adj.|无数的
counter|n./v./adv.|柜台；反驳 counteract|v.|抵消
counterfeit|adj./n./v.|伪造的 counterpart|n.|对应物
countless|adj.|无数的 country|n.|国家；乡村 countryside|n.|乡村
county|n.|县 coup|n.|政变 couple|n./v.|一对；连接
coupon|n.|优惠券 courage|n.|勇气 courageous|adj.|勇敢的
course|n.|课程；过程 court|n./v.|法院；求爱
courteous|adj.|有礼貌的 courtesy|n.|礼貌 courtyard|n.|庭院
cousin|n.|堂兄弟 covenant|n./v.|契约 cover|v./n.|覆盖
covert|adj./n.|秘密的 covet|v.|觊觎 cow|n.|母牛
coward|n.|懦夫 coy|adj.|害羞的 crack|n./v.|裂缝；破解
cradle|n./v.|摇篮 craft|n./v.|工艺；精心制作 crafty|adj.|狡猾的
cram|v.|塞满 cramp|n./v.|痉挛 crane|n./v.|起重机；伸长
crash|n./v.|碰撞 crater|n.|火山口 crave|v.|渴望
crawl|v./n.|爬行 crazy|adj.|疯狂的 cream|n./adj.|奶油
create|v.|创造 creation|n.|创造 creative|adj.|有创造力的
creativity|n.|创造力 creature|n.|生物 credential|n.|证书
credibility|n.|可信度 credible|adj.|可信的 credit|n./v.|信用；归功于
credulous|adj.|轻信的 creek|n.|小溪 creep|v.|爬行
crew|n.|全体船员 crib|n.|婴儿床 crime|n.|犯罪
criminal|n./adj.|罪犯 crimson|n./adj.|深红色
cringe|v.|畏缩 cripple|v./n.|削弱；跛子 crisis|n.|危机
crisp|adj./n.|脆的；薯片 criterion|n.|标准
critic|n.|评论家 critical|adj.|关键的；批评的
criticism|n.|批评 critique|n./v.|评论 crocodile|n.|鳄鱼
crop|n./v.|庄稼；收割 cross|v./n./adj.|穿过；十字
crossing|n.|十字路口 crouch|v./n.|蹲伏 crow|n./v.|乌鸦；啼叫
crowd|n./v.|人群；拥挤 crown|n./v.|王冠 crucial|adj.|关键的
crude|adj./n.|粗糙的；原油 cruel|adj.|残忍的
cruise|v./n.|巡航 crumble|v.|崩溃 crumple|v.|弄皱
crush|v./n.|压碎；迷恋 crust|n.|外壳 cry|v./n.|哭；喊
crystal|n./adj.|水晶 cubic|adj.|立方的 cue|n.|提示
cuisine|n.|烹饪 culminate|v.|达到顶点 culprit|n.|罪犯
cult|n.|邪教；狂热 cultivate|v.|培养 cultivation|n.|培养
cultural|adj.|文化的 culture|n.|文化 cunning|adj./n.|狡猾的
cup|n.|杯子 cupboard|n.|橱柜 curb|v./n.|抑制 cure|n./v.|治疗
curiosity|n.|好奇心 curious|adj.|好奇的 curl|v./n.|卷曲
currency|n.|货币 current|adj./n.|当前的；水流
currently|adv.|目前 curriculum|n.|课程 curse|n./v.|诅咒
cursory|adj.|草率的 curtain|n.|窗帘 curve|n./v.|曲线
cushion|n./v.|垫子 custody|n.|监护权 custom|n.|风俗；习惯
customary|adj.|习惯的 customer|n.|顾客 cut|v./n.|切割
cute|adj.|可爱的 cycle|n./v.|循环 cylinder|n.|圆柱
cynical|adj.|愤世嫉俗的
`.trim();

// 解析额外核心词汇
extraCore.split('\n').forEach(line => {
  line = line.trim();
  if (!line) return;
  const parts = line.split('|');
  if (parts.length >= 3) {
    rootWords.push({ word: parts[0], phonetic: '', pos: parts[1], def: parts[2] });
  }
});
console.log('Total root words after extra core:', rootWords.length);

// 3. 常见前缀规则
const prefixes = [
  { p: 'un', meaning: '不；非', filter: w => ['adj.','v.','n.'].includes(w.pos) },
  { p: 're', meaning: '再；重新', filter: w => w.pos.includes('v') },
  { p: 'dis', meaning: '不；相反', filter: w => ['adj.','v.','n.'].includes(w.pos) },
  { p: 'pre', meaning: '预先；前', filter: w => ['adj.','v.','n.'].includes(w.pos) },
  { p: 'mis', meaning: '错误', filter: w => ['v.','n.'].includes(w.pos) },
  { p: 'over', meaning: '过度；在上', filter: w => ['v.','adj.','n.'].includes(w.pos) },
  { p: 'out', meaning: '超过；外', filter: w => ['v.','n.'].includes(w.pos) },
  { p: 'sub', meaning: '下；亚', filter: w => ['n.','v.','adj.'].includes(w.pos) },
  { p: 'inter', meaning: '之间；相互', filter: w => ['v.','n.','adj.'].includes(w.pos) },
  { p: 'fore', meaning: '预先；前', filter: w => ['v.','n.'].includes(w.pos) },
  { p: 'de', meaning: '去除；向下', filter: w => ['v.','n.'].includes(w.pos) },
  { p: 'trans', meaning: '跨越；转变', filter: w => ['v.','n.'].includes(w.pos) },
  { p: 'super', meaning: '超；超级', filter: w => ['n.','adj.','v.'].includes(w.pos) },
  { p: 'semi', meaning: '半', filter: w => ['n.','adj.'].includes(w.pos) },
  { p: 'anti', meaning: '反对；抗', filter: w => ['n.','adj.','v.'].includes(w.pos) },
  { p: 'mid', meaning: '中间', filter: w => ['n.','adj.'].includes(w.pos) },
  { p: 'under', meaning: '在…下；不足', filter: w => ['v.','n.','adj.'].includes(w.pos) },
  { p: 'counter', meaning: '反对；对应', filter: w => ['v.','n.'].includes(w.pos) },
  { p: 'non', meaning: '非；无', filter: w => ['n.','adj.'].includes(w.pos) },
];

// 4. 常见后缀规则
const suffixes = [
  { s: 'tion', pos: 'n.', tmpl: d => d.replace(/[；;].*/, '') + '的行为/结果' },
  { s: 'ment', pos: 'n.', tmpl: d => d.replace(/[；;].*/, '') + '的行为/状态' },
  { s: 'ness', pos: 'n.', tmpl: d => d.replace(/[；;].*/, '') + '的性质/状态' },
  { s: 'able', pos: 'adj.', tmpl: d => '可' + d.replace(/[；;].*/, '') + '的' },
  { s: 'ible', pos: 'adj.', tmpl: d => '能' + d.replace(/[；;].*/, '') + '的' },
  { s: 'ful', pos: 'adj.', tmpl: d => '充满' + d.replace(/[；;].*/, '') + '的' },
  { s: 'less', pos: 'adj.', tmpl: d => '没有' + d.replace(/[；;].*/, '') + '的' },
  { s: 'ous', pos: 'adj.', tmpl: d => '具有' + d.replace(/[；;].*/, '') + '特质的' },
  { s: 'ive', pos: 'adj.', tmpl: d => '倾向于' + d.replace(/[；;].*/, '') + '的' },
  { s: 'al', pos: 'adj.', tmpl: d => '与' + d.replace(/[；;].*/, '') + '有关的' },
  { s: 'ly', pos: 'adv.', tmpl: d => d.replace(/[；;].*/, '') + '地' },
  { s: 'er', pos: 'n.', tmpl: d => d.replace(/[；;].*/, '') + '的人/工具' },
  { s: 'or', pos: 'n.', tmpl: d => d.replace(/[；;].*/, '') + '者/器' },
  { s: 'ist', pos: 'n.', tmpl: d => d.replace(/[；;].*/, '') + '专家/主义者' },
  { s: 'ism', pos: 'n.', tmpl: d => d.replace(/[；;].*/, '') + '主义/学说' },
  { s: 'ity', pos: 'n.', tmpl: d => d.replace(/[；;].*/, '') + '性/度' },
  { s: 'ize', pos: 'v.', tmpl: d => '使' + d.replace(/[；;].*/, '') + '化' },
  { s: 'ing', pos: 'adj.', tmpl: d => '正在' + d.replace(/[；;].*/, '') + '的' },
  { s: 'ed', pos: 'adj.', tmpl: d => '已被' + d.replace(/[；;].*/, '') + '的' },
];

// 5. 生成派生词
const allWords = new Map();
// 先加入根词
rootWords.forEach(w => allWords.set(w.word.toLowerCase(), w));

// 通用过滤：跳过已含常见后缀的词作为派生根
function hasSuffix(w) {
  return /(?:tion|sion|ment|ness|able|ible|ful|less|ous|ive|ing|edly|ally|ously|ively|ation|ization|ence|ance|ity|ism|ist|ize|ise)$/i.test(w);
}

// 前缀派生（仅应用于动词，且根词长度适中）
prefixes.forEach(({ p, meaning, filter }) => {
  rootWords.forEach(w => {
    if (!w.pos.includes('v')) return;  // 仅对动词加前缀
    if (w.word.length > 12 || w.word.length < 4) return;
    const nw = p + w.word;
    if (nw.length < 5 || nw.length > 18) return;
    if (allWords.has(nw.toLowerCase())) return;
    allWords.set(nw.toLowerCase(), {
      word: nw,
      phonetic: '',
      pos: 'v.',
      def: meaning + w.def.replace(/[；;].*/, '')
    });
  });
});

// 后缀派生 - 禁用（自动派生词质量不佳）
// 仅使用前缀派生 + 根词 + 填充词

console.log('Total words after derivations:', allWords.size);

// 6. 如果还不够，添加常见英语词汇填充
const fillerWords = `abandonment|n.|放弃 abbreviations|n.|缩写 aberrations|n.|异常 abilities|n.|能力 abnormalities|n.|异常 abolishment|n.|废除 abolitionism|n.|废奴主义 aboriginals|n.|原住民 abortionist|n.|堕胎者 abrasiveness|n.|粗暴 absolution|n.|赦免 absolutions|n.|赦免 absorbency|n.|吸收力 abstainers|n.|戒除者 abstractionism|n.|抽象主义 abstractions|n.|抽象概念 abusiveness|n.|虐待 abysmally|adv.|极坏地 academicians|n.|院士 academician|n.|院士 accelerators|n.|加速器 accelerations|n.|加速 accentuation|n.|重音 accentuations|n.|重音 acceptability|n.|可接受性 acceptances|n.|接受 accessorize|v.|配附件 accessorized|adj.|已配附件的 accidentally|adv.|意外地 accidentalism|n.|偶然论 acclamation|n.|欢呼 acclimatize|v.|适应气候 acclimatization|n.|适应 acclivities|n.|上坡 accompaniments|n.|伴奏 accomplishes|v.|完成 accomplishments|n.|成就 accompanist|n.|伴奏者 accompanists|n.|伴奏者 accordingly|adv.|相应地 accountability|n.|问责 accountancy|n.|会计学 accountantship|n.|会计师职位 accreditations|n.|认证 accretions|n.|增长 accumulations|n.|积累 accusatory|adj.|指控的 accusers|n.|控告者 accustoming|v.|使习惯 acerbically|adv.|尖刻地 achievable|adj.|可实现的 achievement|n.|成就 acidification|n.|酸化 acidify|v.|酸化 acknowledgeable|adj.|可承认的 acknowledgment|n.|承认 acoustically|adv.|声学地 acquaintanceship|n.|相识 acquiescent|adj.|顺从的 acquirable|adj.|可获得的 acquisitions|n.|收购 acquisitiveness|n.|贪得 acrophobia|n.|恐高症 actionable|adj.|可诉讼的 activation|n.|激活 activators|n.|激活剂 actualization|n.|实现 actualize|v.|实现 actuate|v.|驱动 actuation|n.|驱动 acupuncturist|n.|针灸师 acuteness|n.|敏锐 adaptations|n.|适应 addictions|n.|上瘾 additionally|adv.|另外 additively|adv.|加法地 addressable|adj.|可寻址的 addressees|n.|收件人 adenoidal|adj.|鼻音的 adeptly|adv.|熟练地 adeptness|n.|熟练 adequacy|n.|充分 adhesiveness|n.|粘性 adjacently|adv.|邻近地 adjournment|n.|休会 adjudication|n.|裁决 adjudicator|n.|裁判 adjustable|adj.|可调节的 adjustment|n.|调整 administratively|adv.|行政上 admirably|adv.|令人钦佩地 admirably|adv.|钦佩地 admirers|n.|仰慕者 admissibility|n.|可采性 admonishment|n.|告诫 admonitions|n.|告诫 adolescently|adv.|青少年般地 adopted|adj.|被收养的 adoptees|n.|被收养者 adoption|n.|收养 adorability|n.|可爱 adorably|adv.|可爱地 adorning|v.|装饰 adornment|n.|装饰 adrenalize|v.|使兴奋 adroitness|n.|灵巧 adultness|n.|成熟 adulthood|n.|成年 adulteration|n.|掺假 adulterers|n.|通奸者 adulterous|adj.|通奸的 advantaged|adj.|有利的 adventurism|n.|冒险主义 adventurously|adv.|冒险地 adversarial|adj.|对抗的 adversely|adv.|不利地 adversities|n.|逆境 advisability|n.|明智 aerially|adv.|空中地 aerobically|adv.|有氧地 aerodynamically|adv.|空气动力学地 aesthetically|adv.|美学地 affability|n.|和蔼 affectedly|adv.|做作地 affectionately|adv.|深情地 affiliations|n.|附属机构 affirmable|adj.|可肯定的 affirmably|adv.|肯定地 affirmations|n.|肯定 affixation|n.|词缀法 affliction|n.|痛苦 affluently|adv.|富裕地 affordably|adj.|负担得起的 affronted|adj.|被冒犯的 aficionado|n.|爱好者 afterbirth|n.|胎盘 afterburner|n.|加力燃烧室 aftercare|n.|后期护理 afterglow|n.|晚霞 afterimage|n.|余像 afterlife|n.|来世 afterlives|n.|来世 aftermarket|n.|售后市场 aftermath|n.|后果 afternoon|n.|下午 afternoons|n.|下午 aftertaste|n.|余味 afterthought|n.|事后想法 afterthoughts|n.|事后想法 afterward|adv.|之后 afterwards|adv.|之后 agedness|n.|老年 agglomerations|n.|凝聚 agglutination|n.|凝集 aggrandizement|n.|扩大 aggrandizing|adj.|扩大的 aggravatingly|adv.|令人恼火地 aggregately|adv.|聚集地 aggressively|adv.|侵略地 agitatedly|adv.|激动地 agnosticism|n.|不可知论 agonizingly|adv.|痛苦地 agreeably|adv.|愉快地 agreeableness|n.|愉快 agriculturalist|n.|农学家 agriculture|n.|农业 aground|adv.|搁浅 aimlessness|n.|漫无目的 airbrush|n./v.|喷枪 aircraft|n.|飞机 airdrop|n./v.|空投 airfield|n.|机场 airily|adv.|轻快地 airlift|n./v.|空运 airmail|n./v.|航空邮件 airship|n.|飞艇 airspace|n.|空域 airstrike|n.|空袭 airway|n.|气道 airworthiness|n.|适航性 airworthy|adj.|适航的 alarmingly|adv.|令人惊恐地 alarmism|n.|危言耸听 alarmist|n.|危言耸听者 albinism|n.|白化病 albumin|n.|白蛋白 albuminous|adj.|含白蛋白的 alchemize|v.|炼金 alcoholic|adj.|含酒精的 alcoholism|n.|酗酒 aldermen|n.|市议员 alderman|n.|市议员 alertly|adv.|警觉地 alertness|n.|警觉 algebraically|adv.|代数地 algorithmic|adj.|算法的 algorithmically|adv.|算法地 alimentary|adj.|消化的 alkalinity|n.|碱度 alkalize|v.|碱化 allegorical|adj.|寓言的 allegorically|adv.|寓言地 allergenic|adj.|过敏原的 allergens|n.|过敏原 allergies|n.|过敏症 alleviation|n.|减轻 alleyway|n.|小巷 alliances|n.|联盟 alligator|n.|鳄鱼 allocate|v.|分配 allocations|n.|分配 allotment|n.|分配 allurement|n.|诱惑 alluringly|adv.|诱人地 allusively|adv.|暗示地 allusiveness|n.|暗示 ally|n./v.|盟友 almanacs|n.|年鉴 almighty|adj.|全能的 almsgiver|n.|施舍者 almsgiving|n.|施舍 aloneness|n.|孤独 alphabetically|adv.|按字母顺序 alphabetize|v.|按字母排列 alphabetization|n.|字母排列 alphanumerical|adj.|字母数字的 alright|adv.|好吧 alternatively|adv.|或者 altimeter|n.|高度计 altruistically|adv.|利他地 amalgamations|n.|合并 amaryllis|n.|孤挺花 amazed|adj.|惊讶的 amazedly|adv.|惊讶地 amazingly|adv.|令人惊讶地 amazement|n.|惊奇 ambassadorial|adj.|大使的 ambassadorship|n.|大使职位 ambassadorships|n.|大使职位 ambidexterity|n.|双手灵巧 ambidextrously|adv.|双手灵巧地 ambiguously|adv.|模糊地 ambitiously|adv.|有雄心地 ambitiousness|n.|雄心 ambivalently|adv.|矛盾地 ambling|v./n.|漫步 ambulance|n.|救护车 ambush|n./v.|伏击 ambushers|n.|伏击者 amelioration|n.|改善 amenability|n.|顺从 amendable|adj.|可修改的 amendments|n.|修正案 amercement|n.|罚金 amiability|n.|和蔼 amiableness|n.|和蔼 amiably|adv.|和蔼地 amicability|n.|友好 amicably|adv.|友好地 amidships|adv.|在船中部 ammunition|n.|弹药 amnestied|v.|赦免 amniotic|adj.|羊膜的 amoeba|n.|变形虫 amoebic|adj.|变形虫的 amorality|n.|非道德性 amorally|adv.|非道德地 amortizable|adj.|可摊销的 amortization|n.|摊销 amortize|v.|摊销 amounting|v.|合计 amperage|n.|安培数 ampersand|n.|&符号 amphetamine|n.|安非他命 amphibian|n./adj.|两栖动物 amphibious|adj.|两栖的 amphitheater|n.|圆形剧场 ampler|adj.|更充足的 amplest|adj.|最充足的 amplification|n.|放大 amplifier|n.|放大器 amputation|n.|截肢 amusement|n.|娱乐 amusingly|adv.|有趣地 anachronistic|adj.|时代错误的 anachronistically|adv.|时代错误地 anaconda|n.|蟒蛇 anaerobically|adv.|厌氧地 analogize|v.|类比 analogously|adv.|类似地 analyses|n.|分析 analyticity|n.|分析性 analyzable|adj.|可分析的 analyzers|n.|分析器 anarchism|n.|无政府主义 anarchistic|adj.|无政府主义的 anarchy|n.|混乱 anatomical|adj.|解剖学的 anatomically|adv.|解剖学地 anatomist|n.|解剖学家 anatomize|v.|解剖 ancestry|n.|血统 anchorage|n.|停泊处 anchoring|n.|锚固 anchorite|n.|隐士 anchorperson|n.|新闻主播 anchovy|n.|凤尾鱼 anciently|adv.|古代地 andiron|n.|柴架 androgynous|adj.|雌雄同体的 androgyny|n.|雌雄同体 anecdotal|adj.|轶事的 anemometer|n.|风速计 anesthesia|n.|麻醉 anesthesiologist|n.|麻醉师 anesthetic|n./adj.|麻醉剂 aneurysm|n.|动脉瘤 angelically|adv.|天使般地 angelica|n.|当归 angering|v.|激怒 angina|n.|心绞痛 angioplasty|n.|血管成形术 angiosperm|n.|被子植物 angle|n./v.|角度 anglers|n.|钓鱼者 anglicize|v.|英国化 anglicism|n.|英国用语 angling|n.|钓鱼 angrily|adv.|愤怒地 angriest|adj.|最愤怒的 angstrom|n.|埃 angst|n.|焦虑 anguish|n./v.|极度痛苦 angularity|n.|棱角 anhydrous|adj.|无水的 animalism|n.|兽性 animalistic|adj.|兽性的 animalize|v.|使兽化 animate|v./adj.|使有生气 animatedly|adv.|生动地 animating|adj.|使人振奋的 animatronics|n.|动画电子 animism|n.|万物有灵论 animosity|n.|敌意 animus|n.|敌意 anise|n.|茴香 aniseed|n.|茴香籽 anklet|n.|脚链 annals|n.|编年史 annexation|n.|吞并 annihilate|v.|歼灭 annihilator|n.|歼灭者 announcements|n.|公告 announcer|n.|播音员 annoyances|n.|烦恼 annoyingly|adv.|令人烦恼地 annually|adv.|每年 annuitant|n.|年金领取者 annulment|n.|废除 anode|n.|阳极 anodize|v.|阳极氧化 anomalously|adv.|异常地 anonymize|v.|匿名化 anonymously|adv.|匿名地 anorexic|adj./n.|厌食的 antenna|n.|天线 anthem|n.|国歌 anthologize|v.|编入选集 anthracite|n.|无烟煤 anthrax|n.|炭疽 anthropogenic|adj.|人为的 anthropoid|adj./n.|类人的 anthropological|adj.|人类学的 anthropologist|n.|人类学家 anthropomorphism|n.|拟人论 anthropomorphize|v.|拟人化 antiabortion|adj.|反堕胎的 antibacterial|adj./n.|抗菌的 antibody|n.|抗体 anticancer|adj.|抗癌的 antichrist|n.|反基督 anticlimactic|adj.|反高潮的 anticlimax|n.|反高潮 anticoagulant|n.|抗凝剂 anticolonial|adj.|反殖民的 anticompetitive|adj.|反竞争的 anticonstitutional|adj.|违宪的 antics|n.|滑稽动作 antidemocratic|adj.|反民主的 antidepressant|n./adj.|抗抑郁药 antidote|n.|解毒剂 antifreeze|n.|防冻液 antifungal|adj./n.|抗真菌的 antihistamine|n.|抗组胺药 antimatter|n.|反物质 antinuclear|adj.|反核的 antioxidant|n./adj.|抗氧化剂 antiparticles|n.|反粒子 antipasto|n.|开胃菜 antipathetic|adj.|反感的 antiperspirant|n.|止汗剂 antiphonal|adj.|对唱的 antipodal|adj.|对跖的 antipoverty|adj.|反贫困的 antiquarian|n./adj.|古文物研究者 antiquary|n.|古文物研究者 antiquation|n.|过时 antiretroviral|adj.|抗逆转录病毒的 antisemitic|adj.|反犹的 antisemitism|n.|反犹主义 antislavery|adj.|反奴隶制的 antismoking|adj.|反吸烟的 antitrust|adj.|反托拉斯的 antiviral|adj./n.|抗病毒的 antler|n.|鹿角 antonym|n.|反义词 antonymous|adj.|反义的 anvil|n.|铁砧 anxieties|n.|焦虑 anxiously|adv.|焦虑地 anybody|pron.|任何人 anyhow|adv.|无论如何 anymore|adv.|再也不能 anyone|pron.|任何人 anything|pron.|任何事物 anytime|adv.|随时 anyway|adv.|无论如何 anywhere|adv.|任何地方 aorta|n.|主动脉 aortic|adj.|主动脉的 apache|n.|阿帕奇 apartheid|n.|种族隔离 apartment|n.|公寓 apathetically|adv.|冷漠地 aperitif|n.|开胃酒 aperture|n.|孔径 apex|n.|顶点 aphasia|n.|失语症 aphid|n.|蚜虫 apiary|n.|养蜂场 apiece|adv.|每个 aplomb|n.|沉着 apnea|n.|呼吸暂停 apocalypse|n.|启示录 apocalyptic|adj.|末世的 apocryphal|adj.|杜撰的 apogee|n.|远地点 apologetically|adv.|抱歉地 apologist|n.|辩护者 apologia|n.|辩护 apologize|v.|道歉 apologizing|v.|道歉 apology|n.|道歉 apoplectic|adj.|中风的 apostasy|n.|叛教 apostate|n.|叛教者 apostle|n.|使徒 apostolic|adj.|使徒的 apostrophe|n.|撇号 apothecary|n.|药剂师 apotheosis|n.|神化 appalled|adj.|震惊的 appallingly|adv.|令人震惊地 apparatchik|n.|官僚 apparatuses|n.|设备 apparently|adv.|显然 apparition|n.|幽灵 appealable|adj.|可上诉的 appealingly|adv.|有吸引力地 appearances|n.|外观 appeasement|n.|绥靖 appeaser|n.|安抚者 appellant|n.|上诉人 appellate|adj.|上诉的 appellation|n.|名称 appendectomy|n.|阑尾切除术 appendices|n.|附录 appetizing|adj.|开胃的 appetizer|n.|开胃菜 applauding|v.|鼓掌 apple|n.|苹果 applicability|n.|适用性 applicably|adv.|适用地 applicant|n.|申请人 applicator|n.|涂敷器 appointed|adj.|指定的 appointee|n.|被任命者 appointment|n.|约会 apportionment|n.|分配 appraisal|n.|评估 appraisers|n.|评估师 appreciably|adv.|相当大地 appreciably|adv.|可察觉地 appreciative|adj.|感激的 appreciatively|adv.|感激地 apprehension|n.|忧虑 apprehensively|adv.|忧虑地 apprenticeship|n.|学徒期 apprenticeships|n.|学徒期 approbation|n.|赞许 appropriate|adj./v.|适当的 appropriation|n.|拨款 approval|n.|批准 approvingly|adv.|赞许地 approximately|adv.|大约 approximations|n.|近似值 appurtenance|n.|附属物 apricot|n.|杏 apron|n.|围弦 aptitude|n.|天资 aptitudes|n.|天资 aptly|adv.|恰当地 aptness|n.|恰当 aquarium|n.|水族馆 aquatic|adj.|水生的 aqueduct|n.|渡槽 aquifer|n.|含水层 arabesque|n.|阿拉伯式花纹 arachnid|n.|蛛形纲 arbitrarily|adv.|任意地 arbitrariness|n.|任意性 arbitrate|v.|仲裁 arbitration|n.|仲裁 arbitrator|n.|仲裁员 arboreal|adj.|树木的 arbor|n.|凉亭 arc|n.|弧 arcades|n.|拱廊 archaic|adj.|古老的 archaically|adv.|古老地 archaism|n.|古语 archangel|n.|大天使 archaeologist|n.|考古学家 archaeology|n.|考古学 archbishop|n.|大主教 archdiocese|n.|大主教管区 archduke|n.|大公 archenemy|n.|主要敌人 archer|n.|弓箭手 archery|n.|射箭 archetype|n.|原型 archipelago|n.|群岛 architect|n.|建筑师 architectonic|adj.|建筑学的 architectural|adj.|建筑的 architecturally|adv.|建筑学上 architrave|n.|楣梁 archival|adj.|档案的 archivist|n.|档案管理员 archness|n.|狡猾 arcing|v.|电弧 ardently|adv.|热烈地 arduously|adv.|艰苦地 arduousness|n.|艰苦 arenas|n.|竞技场 arguable|adj.|可论证的 arguably|adv.|可以说 arguers|n.|争论者 argumentation|n.|论证 argumentatively|adv.|好争论地 argumentativeness|n.|好争论 aridity|n.|干旱 aristocratically|adv.|贵族地 aristocrat|n.|贵族 arithmetic|n.|算术 arm|n./v.|手臂 armadillo|n.|犰狳 armament|n.|军备 armature|n.|电枢 armchair|n./adj.|扶手椅 armful|n.|一抱 armhole|n.|袖孔 armistice|n.|停战 armoire|n.|衣柜 armored|adj.|装甲的 armorer|n.|军械师 armory|n.|军械库 armpit|n.|腋窝 armrest|n.|扶手 armyworm|n.|黏虫 aroma|n.|芳香 aromatherapy|n.|芳香疗法 aromatize|v.|加香 arose|v.|arise过去式 arouse|v.|唤起 arousal|n.|唤起 arraign|v.|传讯 arraignment|n.|传讯 arrangement|n.|安排 arranger|n.|编曲者 arrant|adj.|完全的 array|n./v.|阵列 arrears|n.|欠款 arrestingly|adv.|引人注目地 arrhythmia|n.|心律不齐 arrhythmical|adj.|心律不齐的 arrival|n.|到达 arrogantly|adv.|傲慢地 arrowhead|n.|箭头 arrowroot|n.|葛根 arroyo|n.|旱谷 arsenal|n.|军械库 arsenic|n.|砷 arsonist|n.|纵火犯 arthritic|adj./n.|关节炎的 arthropod|n.|节肢动物 artichoke|n.|洋蓟 articling|v.|签约学徒 artifact|n.|文物 artifice|n.|诡计 artificer|n.|巧匠 artificiality|n.|人为性 artificially|adv.|人工地 artillery|n.|炮兵 artilleryman|n.|炮兵 artily|adv.|做作地 artisan|n.|工匠 artisanal|adj.|工匠的 artistry|n.|艺术性 artless|adj.|天真的 artlessly|adv.|天真地 artlessness|n.|天真 artsy|adj.|假充艺术家的 artwork|n.|艺术品 asbestosis|n.|石棉肺 ascendance|n.|优势 ascendancy|n.|优势 ascendant|adj./n.|上升的 ascender|n.|上升者 ascension|n.|上升 ascent|n.|攀登 ascertainable|adj.|可查明的 ascertainment|n.|查明 ascetically|adv.|禁欲地 asceticism|n.|禁欲主义 ascribable|adj.|可归因的 ascription|n.|归属 aseptic|adj.|无菌的 asexually|adv.|无性地 ashamedly|adv.|羞愧地 ashcan|n.|垃圾桶 ashen|adj.|灰白的 ashlar|n.|方石 ashore|adv.|在岸上 ashtray|n.|烟灰缸 asinine|adj.|愚蠢的 askable|adj.|可问的 askance|adv.|怀疑地 askew|adv./adj.|歪斜 asocial|adj.|不合群的 asparagus|n.|芦笋 aspect|n.|方面 aspen|n.|白杨 asphalt|n./v.|沥青 asphyxia|n.|窒息 asphyxiate|v.|窒息 asphyxiation|n.|窒息 aspirant|n.|有志者 aspirate|v./n.|送气 aspiration|n.|抱负 aspiring|adj.|有抱负的 assailable|adj.|可攻击的 assailant|n.|攻击者 assassin|n.|刺客 assassination|n.|暗杀 assault|n./v.|攻击 assayable|adj.|可化验的 assemblage|n.|集合 assemblyman|n.|议员 assemblywoman|n.|女议员 assertively|adv.|果断地 assertiveness|n.|果断 assessable|adj.|可评估的 assessment|n.|评估 assessor|n.|评估员 assiduity|n.|勤勉 assiduously|adv.|勤勉地 assignable|adj.|可转让的 assignation|n.|约会 assignee|n.|受让人 assignment|n.|任务 assimilation|n.|同化 assistant|n./adj.|助手 assistive|adj.|辅助的 associateship|n.|同事关系 assortment|n.|分类 assuagement|n.|缓和 assumable|adj.|可承担的 assumedly|adv.|假定地 assuredly|adv.|确实地 assuredness|n.|确信 asthmatic|adj./n.|哮喘的 astigmatism|n.|散光 astonishment|n.|惊讶 astonishingly|adv.|令人惊讶地 astoundingly|adv.|令人震惊地 astraddle|adv.|跨着 astringency|n.|收敛性 astringently|adv.|收敛地 astrologer|n.|占星家 astrological|adj.|占星术的 astronautical|adj.|航天的 astronautics|n.|航天学 astronomer|n.|天文学家 astrophysical|adj.|天体物理的 astrophysicist|n.|天体物理学家 astrophysics|n.|天体物理学 astutely|adv.|精明地 astuteness|n.|精明 asymmetrical|adj.|不对称的 asymmetrically|adv.|不对称地 asymptotically|adv.|渐近地 asynchronously|adv.|异步地 atheist|n.|无神论者 atheistic|adj.|无神论的 atherosclerosis|n.|动脉粥样硬化 athlete|n.|运动员 athletic|adj.|运动的 athleticism|n.|运动能力 atlas|n.|地图集 atmospherics|n.|大气效应 atoll|n.|环礁 atomize|v.|雾化 atomizer|n.|雾化器 atonal|adj.|无调性的 atone|v.|赎罪 atonement|n.|赎罪 atonal|adj.|无调性的 atrociously|adv.|残暴地 atrociousness|n.|残暴 atrocities|n.|暴行 atrophied|adj.|萎缩的 atrophying|v.|萎缩 attache|n.|专员 attached|adj.|依恋的 attachment|n.|附件 attacker|n.|攻击者 attainability|n.|可达到性 attainder|n.|剥夺公权 attainment|n.|成就 attemptable|adj.|可尝试的 attendance|n.|出席 attentively|adv.|注意地 attentiveness|n.|注意 attenuator|n.|衰减器 attest|v.|证明 attestation|n.|证明 attic|n.|阁楼 attics|n.|阁楼 attorney|n.|律师 attorneyship|n.|律师职位 attractiveness|n.|吸引力 attributable|adj.|可归因的 attributably|adv.|可归因地 attribution|n.|归属 attributive|adj.|定语的 attrition|n.|消耗 atypical|adj.|非典型的 atypically|adv.|非典型地 audacious|adj.|大胆的 audaciously|adv.|大胆地 audacity|n.|大胆 audibility|n.|可听度 audience|n.|观众 audiobook|n.|有声书 audiophile|n.|音响发烧友 auditable|adj.|可审计的 auditions|n.|试镜 auditorium|n.|礼堂 audit|n./v.|审计 augment|v.|增加 augmentation|n.|增加 augustness|n.|威严 auntie|n.|阿姨 aural|adj.|听觉的 aureole|n.|光环 auricle|n.|心耳 aurora|n.|极光 auspiciously|adv.|吉利地 auspiciousness|n.|吉利 austerity|n.|紧缩 austerely|adv.|严厉地 authentically|adv.|真实地 authentication|n.|认证 authenticator|n.|认证者 authoritarianism|n.|独裁主义 authoritarians|n.|独裁者 authoritatively|adv.|权威地 authoritarianism|n.|威权主义 authorization|n.|authorization autobiography|n.|自传 autobiographical|adj.|自传的 autobiographer|n.|自传作者 autocracy|n.|独裁 autocratically|adv.|独裁地 autocrat|n.|独裁者 autodial|v.|自动拨号 autographed|adj.|亲笔签名的 autographing|v.|签名 autographs|n.|签名 autoimmune|adj.|自身免疫的 autoimmunity|n.|自身免疫 automaker|n.|汽车制造商 automated|adj.|自动的 automatically|adv.|自动地 automotive|adj.|汽车的 autonomic|adj.|自主的 autonomously|adv.|自主地 autopilot|n.|自动驾驶 autopsied|v.|尸检 autopsy|n.|尸检 autosuggestion|n.|自我暗示 autumnal|adj.|秋天的 auxiliary|adj.|辅助的 auxiliaries|n.|辅助人员 availability|n.|可用性 avalanche|n.|雪崩 avantgarde|n./adj.|前卫 avariciously|adv.|贪婪地 avenge|v.|报仇 avenger|n.|复仇者 avenue|n.|大街 average|n./adj./v.|平均 averagely|adv.|平均地 averment|n.|断言 aversion|n.|厌恶 aversively|adv.|厌恶地 avian|adj.|鸟类的 aviary|n.|鸟舍 avidity|n.|渴望 avidly|adv.|热切地 avionic|adj.|航空电子的 avionics|n.|航空电子 avocado|n.|牛油果 avocation|n.|副业 avoidable|adj.|可避免的 avoidably|adv.|可避免地 avoidance|n.|避免 avowal|n.|承认 avowedly|adv.|公然地 avuncular|adj.|叔伯般的 await|v.|等待 awakened|adj.|觉醒的 award|n./v.|奖品 awarding|n.|授予 awareness|n.|意识 awash|adj.|被淹没的 awesome|adj.|令人敬畏的 awesomely|adv.|令人敬畏地 awful|adj.|可怕的 awfully|adv.|非常 awkwardly|adv.|尴尬地 awkwardness|n.|尴尬 awning|n.|遮阳篷 awoken|v.|awake过去分词 axe|n./v.|斧头 axial|adj.|轴的 axiom|n.|公理 axiomatic|adj.|公理的 axiomatically|adv.|公理地 axle|n.|车轴 axon|n.|轴突 azure|adj./n.|天蓝色
acclaim|n./v.|欢呼 acclamation|n.|欢呼 accede|v.|同意 accessible|adj.|可进入的 accessory|n.|附件 accidentally|adv.|意外地 accomplice|n.|同谋 accomplishment|n.|成就 accordance|n.|一致 accountancy|n.|会计 accredited|adj.|认可的 accumulation|n.|积累 accurately|adv.|准确地 accused|n./adj.|被告 achievement|n.|成就 acknowledgment|n.|承认 acquaintance|n.|熟人 acquisition|n.|收购 acutely|adv.|敏锐地 adaptability|n.|适应性 adaptable|adj.|可适应的 additionally|adv.|另外 adequately|adv.|充分地 adhesive|n./adj.|粘合剂 adjournment|n.|休会 adjustable|adj.|可调节的 administration|n.|管理 admirable|adj.|令人钦佩的 admirably|adv.|令人钦佩地 admittedly|adv.|诚实地 adolescence|n.|青春期 adoption|n.|收养 adornment|n.|装饰 advantageous|adj.|有利地 adventurously|adv.|冒险地 adversely|adv.|不利地 advertisement|n.|广告 advisability|n.|明智 advisory|adj.|咨询的 affectionately|adv.|深情地 affordable|adj.|负担得起的 aftermarket|n.|售后 aggression|n.|侵略 aggressively|adv.|侵略地 agnostic|n./adj.|不可知论者 agonizingly|adv.|痛苦地 agreeably|adv.|愉快地 aimlessly|adv.|漫无目的地 airline|n.|航空公司 alcoholism|n.|酗酒 alertness|n.|警觉 algebraically|adv.|代数地 algorithmic|adj.|算法的 alignment|n.|对齐 allegory|n.|寓言 allergy|n.|过敏症 alleviation|n.|减轻 allocation|n.|分配 allowance|n.|津贴 allurement|n.|诱惑 amazingly|adv.|令人惊讶地 ambassador|n.|大使 ambiguously|adv.|模糊地 ambitiously|adv.|有雄心地 amenability|n.|顺从 amiably|adv.|和蔼地 amicably|adv.|友好地 ammunition|n.|弹药 amphibian|n./adj.|两栖动物 amusement|n.|娱乐 analogously|adv.|类似地 anarchism|n.|无政府主义 ancestry|n.|血统 anchovy|n.|凤尾鱼 androgynous|adj.|雌雄同体的 anesthesia|n.|麻醉 angelically|adv.|天使般地 angiosperm|n.|被子植物 angularity|n.|棱角 animalistic|adj.|兽性的 animatedly|adv.|生动地 animosity|n.|敌意 annexation|n.|吞并 announcer|n.|播音员 annoyance|n.|烦恼 annulment|n.|废除 anomalously|adv.|异常地 anonymity|n.|匿名 antagonism|n.|对抗 antagonize|v.|对抗 antecedent|n./adj.|前事 anthem|n.|国歌 anthropology|n.|人类学 antibacterial|adj./n.|抗菌的 antibody|n.|抗体 anticlimax|n.|反高潮 antidote|n.|解毒剂 antioxidant|n./adj.|抗氧化剂 antiquarian|n./adj.|古文物研究者 antonym|n.|反义词 anxiety|n.|焦虑 anybody|pron.|任何人 anyhow|adv.|无论如何 anyone|pron.|任何人 anything|pron.|任何事物 anyway|adv.|无论如何 anywhere|adv.|任何地方 aorta|n.|主动脉 apartheid|n.|种族隔离 apathetically|adv.|冷漠地 aperture|n.|孔径 aphorism|n.|格句 apocalypse|n.|大灾难 apocryphal|adj.|杜撰的 apologetically|adv.|抱歉地 apologist|n.|辩护者 apostrophe|n.|撒号 appetizer|n.|开胃菜 applicability|n.|适用性 applicant|n.|申请人 appreciably|adv.|相当大地 appreciatively|adv.|感激地 apprehensively|adv.|忧虑地 apprenticeship|n.|学徒期 approbation|n.|赞许 appropriation|n.|拨款 approvingly|adv.|赞许地 approximately|adv.|大约 aquarium|n.|水族馆 aquifer|n.|含水层 arbitrarily|adv.|任意地 arbitration|n.|仲裁 archaeology|n.|考古学 archbishop|n.|大主教 archetype|n.|原型 architecturally|adv.|建筑学上 archivist|n.|档案管理员 ardently|adv.|热烈地 arduously|adv.|艰苦地 arguably|adv.|可以说 argumentation|n.|论证 aristocratically|adv.|贵族地 arithmetic|n.|算术 armadillo|n.|犰狐 armistice|n.|停战 aromatherapy|n.|芳香疗法 arrangement|n.|安排 arrestingly|adv.|引人注目地 arrival|n.|到达 arrogantly|adv.|傲慢地 arrowhead|n.|箭头 arsonist|n.|纵火犯 artfully|adv.|狡猾地 articulately|adv.|口齿清楚地 artificially|adv.|人工地 artistry|n.|艺术性 artlessly|adv.|天真地 artwork|n.|艺术品 ascription|n.|归属 asparagus|n.|芦笋 aspiration|n.|抱负 assassin|n.|刺客 assemblage|n.|集合 assertively|adv.|果断地 assertiveness|n.|果断 assessment|n.|评估 assiduously|adv.|勤勉地 assimilation|n.|同化 assistive|adj.|辅助的 assortment|n.|分类 assuredly|adv.|确实地 astigmatism|n.|散光 astonishingly|adv.|令人惊讶地 astoundingly|adv.|令人震惊地 astrologer|n.|占星家 astronautics|n.|航天学 astrophysics|n.|天体物理学 asymmetrically|adv.|不对称地 asymptotically|adv.|渐近地 atheistic|adj.|无神论的 atmosphere|n.|大气层 atomizer|n.|雾化器 atonement|n.|赎罪 atrociously|adv.|残暴地 atrociousness|n.|残暴 attainment|n.|成就 attentively|adv.|注意地 attentiveness|n.|注意 attorney|n.|律师 attractiveness|n.|吸引力 attribution|n.|归属 atypically|adv.|非典型地 audaciously|adv.|大胆地 audibility|n.|可听度 audiobook|n.|有声书 augmentation|n.|增加 auspiciously|adv.|吉利地 authentically|adv.|真实地 authentication|n.|认证 authoritatively|adv.|权威地 autobiographical|adj.|自传的 autocratically|adv.|独裁地 autoimmune|adj.|自身免疫的 automatically|adv.|自动地 autonomously|adv.|自主地 auxiliary|adj.|辅助的 availability|n.|可用性 avantgarde|n./adj.|前卫 avariciously|adv.|贪婪地 avenger|n.|复仇者 averagely|adv.|平均地 aversively|adv.|厌恶地 avidly|adv.|热切地 avocation|n.|副业 avoidably|adv.|可避免地 avowedly|adv.|公然地 awakened|adj.|觉醒的 awareness|n.|意识 awesomely|adv.|令人敬畏地 awfully|adv.|非常 awkwardly|adv.|尴尬地 awkwardness|n.|尴尬 axiomatic|adj.|公理的
baboon|n.|狒狒 backpack|n./v.|背包 backpacker|n.|背包客 backpacking|n.|背包旅行 backside|n.|背面 backspace|v./n.|退格 backstroke|n.|仰泳 backwater|n.|死水 backdrop|n.|背景 backer|n.|支持者 backlash|n.|强烈反对 backlog|n.|积压 backwardness|n.|落后 bacon|n.|培根 bacterium|n.|细菌 bacteriological|adj.|细菌学的 badly|adv.|严重地 badminton|n.|羽毛球 baffle|v.|使困惑 bafflement|n.|困惑 baffling|adj.|令人困惑的 bagel|n.|面包圈 baggy|adj.|宽松的 bagpipe|n.|风笛 bailiff|n.|法警 bailout|n.|救助 baker|n.|面包师 bakery|n.|面包店 balancing|n.|平衡 balcony|n.|阳台 balderdash|n.|胡言乱语 baleful|adj.|恶意的 balky|adj.|固执的 ballad|n.|民谣 ballast|n.|压舱物 ballerina|n.|芭蕾女演员 ballistics|n.|弹道学 balloonist|n.|气球驾驶员 ballpark|n./adj.|棒球场 ballroom|n.|舞厅 ballyhoo|n./v.|大吹大插 balm|n.|香膏 balmy|adj.|温和的 balustrade|n.|栏杆 bamboo|n.|竹子 bandage|n./v.|绷带 bandit|n.|强盗 bandstand|n.|音乐台 bandwidth|n.|带宽 baneful|adj.|有害的 bang|n./v.|猛击 bangle|n.|手镯 banishment|n.|放逐 banister|n.|栏杆扶手 banjo|n.|班卓琴 bankruptcy|n.|破产 banquet|n.|宴会 banshee|n.|女妖 bantam|n.|矮脚鸡 banter|n./v.|玩笑 baptism|n.|洗礼 baptistery|n.|洗礼堂 barbarian|n./adj.|野蛮人 barbaric|adj.|野蛮的 barbarism|n.|野蛮 barbarity|n.|残忍 barbarous|adj.|残暴的 barbecue|n./v.|烧烤 barbed|adj.|有倒钩的 barber|n.|理发师 barefoot|adj./adv.|赤脚的 barely|adv.|几乎不 barf|v./n.|呕吐 bargain|n./v.|便宜货 barge|n./v.|驳船 baritone|n.|男中音 bark|v./n.|吠叫 barley|n.|大麦 barnacle|n.|藤壶 barnyard|n.|谷仓场院 barometer|n.|气压计 baroness|n.|男爵夫人 baroque|adj.|巴洛克风格的 barrack|n.|兵营 barracks|n.|兵营 barrage|n.|弹幕 barrel|n.|桶 barrenness|n.|贫瘠 barricade|n./v.|路障 barrier|n.|障碍 bartender|n.|酒保 barter|v./n.|以物易物 basalt|n.|玄武岩 baseball|n.|棒球 basement|n.|地下室 bashful|adj.|害羞的 basin|n.|盆地 basketball|n.|篮球 bassist|n.|贝斯手 bassoon|n.|大管 bastard|n./adj.|杂种 bastardize|v.|使 bastardization|n.|篡改 bathe|v.|沐浴 bathrobe|n.|浴袍 bathroom|n.|浴室 bathtub|n.|浴缸 battalion|n.|营 batter|v./n.|连续猛击 battlefield|n.|战场 battleground|n.|战场 battlegrounds|n.|战场 battlefront|n.|前线 battleship|n.|战列舰 bauble|n.|小玩意 bawdy|adj.|下流的 bayonet|n.|刺刀 bazaar|n.|集市 beachcomber|n.|海滩拾荒者 beachfront|n.|海滨 beachhead|n.|滩头阵地 beadwork|n.|珠饰 beagle|n.|猎兔犬 beak|n.|鸟嘴 beaker|n.|烧杯 beanstalk|n.|豆茎 bearable|adj.|可忍受的 beard|n.|胡须 bearer|n.|持有人 bearish|adj.|看跌的 beastly|adj.|兽性的 beatific|adj.|祝福的 beatification|n.|祝福 beatify|v.|祝福 beating|n.|殴打 beatitude|n.|祝福 beau|n.|男友 beautician|n.|美容师 beautification|n.|美化 beautifier|n.|美化者 beautifully|adv.|美丽地 beautify|v.|美化 bedazzle|v.|使眩目 bedazzlement|n.|困惑 bedbug|n.|臭虫 bedding|n.|寝具 bedeck|v.|装饰 bedevil|v.|折磨 bedfellow|n.|同床者 bedraggle|v.|使淋湿 bedridden|adj.|卧床不起的 bedroom|n.|卧室 bedside|n.|床边 bedspread|n.|床罩 bedstead|n.|床架 bedtime|n.|就寝时间 beehive|n.|蜂箱 beeper|n.|寻呼机 beeswax|n.|蜂蜡 beetle|n.|甲虫 befall|v.|降临 befog|v.|使困惑 before|prep./conj.|在…之前 beforehand|adv.|事先 befoul|v.|弄脏 befriend|v.|与…为友 befuddle|v.|使困惑 beggar|n.|乞丐 beggarly|adj.|贫穷的 begin|v.|开始 beginner|n.|初学者 beginning|n.|开始 begrime|v.|弄脏 begrudge|v.|嫉妒 beguile|v.|欺骗 beguiling|adj.|迷人的 behavioral|adj.|行为的 behaviorism|n.|行为主义 behaviorist|n.|行为主义者 behindhand|adv.|落后地 behold|v.|看见 beholden|adj.|受恩惠的 beholder|n.|观看者 behoove|v.|理应 bejewel|v.|饰以珠宝 belabor|v.|过分强调 belated|adj.|迟到的 belatedly|adv.|迟到地 belay|v.|固定 belch|v./n.|打嗝 beleaguer|v.|围攻 belfry|n.|钟塔 believable|adj.|可信的 believer|n.|信徒 belittle|v.|轻视 bellicose|adj.|好战的 belligerence|n.|好战 belligerency|n.|交战 belligerent|adj.|好战的 bellows|n.|风箱 bellyache|n./v.|腹痛 bellybutton|n.|肚脐 bellyful|n.|满腹 belonged|v.|属于 belongings|n.|财物 beloved|adj./n.|心爱的 below|prep./adv.|在…下方 beltway|n.|环城公路 bemire|v.|使陷入泥沼 bemoan|v.|悲叹 bemuse|v.|使困惑 bemused|adj.|困惑的 benchmark|n.|基准 bendable|adj.|可弯曲的 bender|n.|弯曲者 bending|n.|弯曲 beneath|prep./adv.|在…下方 benediction|n.|祝福 benefactor|n.|恩人 benefactress|n.|女恩主 benefice|n.|采邑 beneficence|n.|善行 beneficent|adj.|行善的 beneficially|adv.|有益地 beneficiary|n.|受益人 benevolence|n.|仁慈 benevolently|adv.|仁慈地 benighted|adj.|愚昧的 benignant|adj.|仁慈的 benignly|adv.|仁慈地 bequeath|v.|遗赠 bequest|n.|遗产 berate|v.|严厉斥责 bereave|v.|使丧失 bereavement|n.|丧亲 bereft|adj.|丧失的 beret|n.|贝雷帽 berserk|adj./adv.|疯狂的 berth|n./v.|泊位 beseech|v.|恳求 beset|v.|困扰 besiege|v.|围攻 besmear|v.|弄脏 besmirch|v.|玷污 besom|n.|扫帚 besot|v.|使糊涂 besotted|adj.|糊涂的 besought|v.|beseech过去式 bespangle|v.|饰以亮片 bespatter|v.|溅污 bespoke|adj.|定制的 bestial|adj.|兽性的 bestiality|n.|兽性 bestir|v.|激励 bestow|v.|授予 bestowal|n.|授予 bestride|v.|跨越 betake|v.|前往 bethink|v.|思考 betide|v.|发生 betoken|v.|预示 betray|v.|背叛 betrayal|n.|背叛 betrayer|n.|背叛者 betroth|v.|订婚 betrothal|n.|订婚 betrothed|n./adj.|未婚夫 betterment|n.|改善 between|prep.|在…之间 betwixt|adv./prep.|在其间 bevel|n./v.|斜面 bevy|n.|一群 bewail|v.|悲叹 bewildered|adj.|困惑的 bewildering|adj.|令人困惑的 bewilderment|n.|困惑 bewitch|v.|迷住 bewitching|adj.|迷人的 bewitchment|n.|魔力 bey|n.|总督 beyond|prep./adv.|超出 biannual|adj.|每两年的 biannually|adv.|每两年地 biathlon|n.|冬季两项 bib|n.|围嘴 bible|n.|圣经 biblical|adj.|圣经的 bibliographer|n.|书志学家 bibliography|n.|参考书目 bibliophile|n.|藏书家 bicameral|adj.|两院制的 bicentenary|n./adj.|两百周年 bicentennial|n./adj.|两百周年 bicep|n.|二头肌 bicker|v./n.|争吵 bicuspid|adj./n.|二尖瓣的 bicycle|n./v.|自行车 bicyclist|n.|自行车手 biddable|adj.|顺从的 bidder|n.|投标者 bidding|n.|出价 bide|v.|等待 bidirectional|adj.|双向的 biennial|adj./n.|两年一次的 biennially|adv.|每两年地 bifocal|adj./n.|双光的 bifocals|n.|双光眼镜 bifurcate|v.|分叉 bifurcation|n.|分叉 bigamist|n.|重婚者 bigamous|adj.|重婚的 bigamy|n.|重婚 bigger|adj.|更大的 biggest|adj.|最大的 bighorn|n.|大角羊 bight|n.|海湾 bigmouth|n.|大嘴巴 bigot|n.|偏执者 bigoted|adj.|偏执的 bigotry|n.|偏执 bikini|n.|比基尼 bilateral|adj.|双边的 bilaterally|adv.|双边地 bilingual|adj./n.|双语的 bilingualism|n.|双语能力 bilious|adj.|胆汁的 billfold|n.|钱夹 billiards|n.|台球 billing|n.|账单 billboard|n.|广告牌 billion|n.|十亿 billionaire|n.|亿万富翁 billionth|adj./n.|第十亿 billow|v./n.|翻滚 billy|n.|棍棒 bimbo|n.|花瓶 bimonthly|adj./adv./n.|双月的 binary|adj./n.|二进制的 bind|v.|捆绑 binder|n.|活页夹 binding|adj./n.|约束力的 bindweed|n.|旋花类 binge|v./n.|狂吃生物化学|n.|生物化学 biochemical|adj.|生物化学的 biochemist|n.|生物化学家 biochemistry|n.|生物化学 biodegradable|adj.|可生物降解的 biodiversity|n.|生物多样性 bioethics|n.|生物伦理学 biofeedback|n.|生物反馈 biographer|n.|传记作者 biographic|adj.|传记的 biographical|adj.|传记的 biography|n.|传记 biologic|adj.|生物学的 biological|adj.|生物学的 biologically|adv.|生物学地 biologist|n.|生物学家 biology|n.|生物学 biomass|n.|生物量 biome|n.|生物群落 biomedical|adj.|生物医学的 bionic|adj.|仿生的 biophysics|n.|生物物理学 biopsy|n.|活检 biorhythm|n.|生物节律 biosphere|n.|生物圈 biotechnology|n.|生物技术 bioterrorism|n.|生物恐怖主义 bipartisan|adj.|两党的 bipartite|adj.|双边的 biped|n./adj.|两足动物 bipedal|adj.|两足的 biplane|n.|双翼机 biracial|adj.|两种族的 birch|n./v.|桦树 birdcage|n.|鸟笼 birdhouse|n.|鸟舍 birdie|n.|小鸟 birdseed|n.|鸟食 birdwatcher|n.|观鸟者 birdwatching|n.|观鸟 birdwing|n.|鸟翼 birth|n.|出生 birthday|n.|生日 birther|n.|出生主义者 birthmark|n.|胎记 birthplace|n.|出生地 birthrate|n.|出生率 birthright|n.|与生俱来的权利 birthstone|n.|诞生石 biscuit|n.|饼干 bisexual|adj./n.|双性恋的 bisect|v.|平分 bisection|n.|平分 bisector|n.|平分线 bishop|n.|主教 bishopric|n.|主教区 bismuth|n.|镖 bison|n.|野牛 bistable|adj.|双稳态的 bistro|n.|小餐馆 bit|n.|一点 bitch|n./v.|母狗；抱怨 bitcoin|n.|比特币 bite|v./n.|咬 biter|n.|咬人者 bitingly|adv.|辛辣地 bitmap|n.|位图 bitten|v.|bite过去分词 bitter|adj./n.|苦的；痛苦 bitterly|adv.|痛苦地 bitterness|n.|苦味 bittersweet|adj./n.|苦甜参半的 bitumen|n.|沥青 bivalve|n./adj.|双壳类 bivouac|n./v.|露营 biweekly|adj./adv./n.|双周的 bizarrely|adv.|奇异地 blackberry|n.|黑莓 blackbird|n.|黑鸟 blackboard|n.|黑板 blacken|v.|使变黑 blackhead|n.|黑头 blackish|adj.|微黑的 blacklist|n./v.|黑名单 blackmail|n./v.|勒索 blackmailer|n.|勒索者 blackness|n.|黑暗 blacksmith|n.|铁匠 bladder|n.|膀胱 blade|n.|刀刃 blame|v./n.|责备 blameless|adj.|无可指责的 blamelessly|adv.|无可指责地 blameworthiness|n.|应受责备 blameworthy|adj.|应受责备的 bland|adj.|乏味的 blandish|v.|奉承 blandishment|n.|奉承 blandly|adv.|乏味地 blandness|n.|平淡 blank|adj./n.|空白的 blanket|n./adj.|毯子 blankly|adv.|茫然地 blankness|n.|空白 blare|v./n.|发出刺耳声 blaspheme|v.|襄渎 blasphemous|adj.|襄渎的 blasphemy|n.|襄渎 blast|n./v.|爆炸 blastoff|n.|发射 blatant|adj.|公然的 blatantly|adv.|公然地 blaze|n./v.|火焰 blazer|n.|运动上衣 blazing|adj.|燃烧的 bleach|v./n.|漂白 bleacher|n.|看台 bleakly|adv.|荒凉地 bleakness|n.|荒凉 blearily|adv.|模糊地 bleary|adj.|模糊的 bleat|v./n.|咩咩叫 bleed|v.|流血 bleeder|n.|出血者 bleeding|n./adj.|出血的 blemish|n./v.|瑕疵 blend|v./n.|混合 blender|n.|搅拌机 blessing|n.|祝福 blight|n./v.|枯萎病 blimp|n.|飞艇 blind|adj./v.|盲的 blinder|n.|遮眼物 blindfold|v./n./adj.|蒙住眼睛的 blindly|adv.|盲目地 blindness|n.|失明 blindside|v.|攻击盲点 blink|v./n.|眨眼 blinker|n.|闪光灯 blinking|adj.|闪烁的 blip|n.|短暂信号 bliss|n.|极乐 blissful|adj.|极乐的 blissfully|adv.|极乐地 blister|n./v.|水泡 blistering|adj.| blistering blithe|adj.|愉快的 blithely|adv.|愉快地 blithering|adj.|十足的 blithesome|adj.|快乐的 blitz|n./v.|闪电战 blitzkrieg|n.|闪电战 blizzard|n.|暴风雪 bloated|adj.|膨胀的 bloating|n.|膨胀 blob|n.|一团 block|n./v.|街区 blockade|n./v.|封锁 blockade|n.|封锁 blocker|n.|阻拦者 blocking|n.|阻塞 blocky|adj.|块状的 blog|n./v.|博客 blogger|n.|博主 blonde|adj./n.|金发的 blood|n.|血液 bloodcurdling|adj.|令人毛骨悚然的 blooded|adj.|血统纯正的 bloodhound|n.|猎犬 bloodied|adj.|血迹斑斑的 bloodless|adj.|无血的 bloodletting|n.|放血 bloodline|n.|血统 bloodlust|n.|杀戮欲 bloodshed|n.|流血事件 bloodshot|adj.|充血的 bloodstain|n.|血迹 bloodstained|adj.|血迹斑斑的 bloodstream|n.|血流 bloodsucker|n.|吸血动物 bloodthirstiness|n.|嗜血 bloodthirsty|adj.|嗜血的 bloody|adj./v.|血腥的 bloom|v./n.|开花 bloomer|n.|花 blooming|adj.|盛开的 blooper|n.|失误 blossom|v./n.|开花 blot|n./v.|污点 blotch|n./v.|斑点 blouse|n.|女衬衫 blow|v./n.|吹 blowfish|n.|河豚 blowgun|n.|吹箭筒 blowhard|n.|自吹自擂的人 blowhole|n.|喷气孔 blown|v.|blow过去分词 blowout|n.|爆裂 blowpipe|n.|吹管 blowtorch|n.|喷灯 blowup|n.|爆炸 blubber|n./v.|鲸脂；哭诉 bludgeon|n./v.|大棒 bluff|v./n./adj.|虚张声势 bluish|adj.|微蓝的 blunder|n./v.|大错 blunderbuss|n.|大错 blunt|adj./v.|钝的 bluntly|adv.|直率地 bluntness|n.|直率 blur|v./n.|模糊 blurb|n.|简介 blurred|adj.|模糊的 blurry|adj.|模糊的 blurt|v.|脱口而出 blush|v./n.|脸红 bluster|v./n.|咆哮 blustery|adj.|狂风大作的 boa|n.|蟒蛇 boar|n.|公猪 boarder|n.|寄宿者 boardroom|n.|董事会 boardwalk|n.|木栈道 boastful|adj.|自夸的 boastfully|adv.|自夸地 boastfulness|n.|自夸 boater|n.|划船者 boating|n.|划船 boatman|n.|船夫 boatmanship|n.|船夫技术 boatswain|n.|水手长 bob|v./n.|上下晃动 bobbin|n.|线轴 bobble|v./n.|摇晃 bobcat|n.|山猫 bobsled|n./v.|雪橇 bobsleigh|n.|雪橇 bodily|adj./adv.|身体的；整体地 bodkin|n.|大眼针 bodybuilding|n.|健美 bodyguard|n.|保镖 bodysuit|n.|紧身衣 bodywork|n.|车身 bog|n./v.|沼泽 bogey|n./v.|可怕的人；标准杆 bogeyman|n.|可怕的人 boggle|v.|使惊愕 boggy|adj.|沼泽的 bogus|adj.|伪造的 bohemian|n./adj.|波西米亚人 boil|v./n.|煮沸 boiler|n.|锅炉 boilermaker|n.|锅炉工 boiling|adj./n.|沸腾的 boisterous|adj.|喧闹的 boisterously|adv.|喧闹地 boisterousness|n.|喧闹 bold|adj.|大胆的 bolder|adj.|更大胆的 boldest|adj.|最大胆的 boldface|n.|粗体 boldly|adv.|大胆地 boldness|n.|大胆 bolero|n.|短外套；波莱罗舞 boll|n.|棉铃 bollard|n.|系船柱 bolster|v./n.|支持 bolt|n./v.|螺栓 bolthole|n.|藏身处 bombardier|n.|投弹手 bombardment|n.|轰炸 bombast|n.|大话 bombastic|adj.|夸大的 bombed|adj.|被轰炸的 bomber|n.|轰炸机 bombproof|adj.|防炸弹的 bombshell|n.|炸弹；惊人消息 bonanza|n.|富矿 bonbon|n.|糖果 bond|n./v.|纽带 bondage|n.|束缚 bondholder|n.|债券持有人 bonding|n.|结合 bondman|n.|奴隶 bonfire|n.|篝火 bong|n.|钟声 bongo|n.|邦戈鼓 bonhomie|n.|和蔼 bonkers|adj.|疯狂的 bonnet|n.|帽子 bonny|adj.|漂亮的 bonsai|n.|盆景 bonus|n.|奖金 bony|adj.|骨瘦如柴的 bonze|n.|和尚 boo|v./n.|嘘声 boob|n.|傻瓜 booby|n.|傻瓜 boogie|v./n.|布吉舞 bookbinder|n.|装订工 bookbinding|n.|装订 bookcase|n.|书柜 bookend|n.|书挡 bookie|n.|赌注经纪人 booking|n.|预订 bookish|adj.|书呆子气的 bookkeeper|n.|簿记员 bookkeeping|n.|簿记 booklet|n.|小册子 bookmaker|n.|赌注经纪人 bookmark|n./v.|书签 bookmobile|n.|流动图书馆 bookseller|n.|书商 bookshelf|n.|书架 bookshop|n.|书店 bookstore|n.|书店 bookworm|n.|书虫 boombox|n.|手提音响 boomerang|n./v.|回旋镖 booming|adj.|蓬勃发展的 boon|n.|福利 boondocks|n.|偏远地区 boondoggle|n./v.|浪费 boor|n.|粗人 boorish|adj.|粗鲁的 boorishly|adv.|粗鲁地 boorishness|n.|粗鲁 boost|v./n.|促进 booster|n.|助推器 boot|n./v.|靴子 bootblack|n.|擦鞋童 booth|n.|摊位 bootie|n.|短靴 bootleg|v./n./adj.|走私 bootlegger|n.|走私者 bootless|adj.|无用的 bootstrap|v./n.|引导 bootstrapping|n.|自举 booty|n.|战利品 booze|v./n.|酗酒 boozer|n.|酒鬼 boozy|adj.|醉醺醺的 bop|v./n.|爵士乐 bordello|n.|妓院 border|n./v.|边界 borderland|n.|边境 borderless|adj.|无国界的 borderline|n./adj.|边界线 bore|v./n.|使厌烦 bored|adj.|无聊的 boredom|n.|无聊 borehole|n.|钻孔 boring|adj.|无聊的 born|adj.|天生的 borne|v.|bear过去分词 borough|n.|自治市镇 borrow|v.|借入 borrower|n.|借款人 borrowing|n.|借款 borscht|n.|罗宋汤 bosom|n./adj.|胸部 boss|n./v.|老板 bossiness|n.|专横 bossy|adj.|专横的 botanical|adj.|植物学的 botanically|adv.|植物学地 botanist|n.|植物学家 botany|n.|植物学 botch|v./n.|搞砸 bother|v./n.|打扰 bothersome|adj.|令人烦恼的 bottleneck|n.|瓶颈 bottom|n./adj.|底部 bottomland|n.|低地 bottomless|adj.|无底的 botulism|n.|肉毒杆菌中毒 boudoir|n.|闺房 bouffant|adj./n.|蓬松的 bough|n.|树枝 bought|v.|buy过去式 bouillabaisse|n.|马赛鱼汤 bouillon|n.|清汤 boulder|n.|巨石 boulevard|n.|林荫大道 bounce|v./n.|弹跳 bouncer|n.|保镖 bouncy|adj.|有弹性的 bound|v./adj./n.|跳跃 bounden|adj.|义不容辞的 bounder|n.|粗人 boundless|adj.|无限的 boundlessly|adv.|无限地 boundlessness|n.|无限 bounteous|adj.|慷慨的 bountifully|adv.|丰富地 bountifulness|n.|丰富 bounty|n.|赏金 bouquet|n.|花束 bourgeois|n./adj.|资产阶级 bourgeoisie|n.|资产阶级 bout|n.|一回 boutique|n.|精品店 bovine|adj./n.|牛的 bow|v./n.|鞠躬 bowdlerize|v.|删改 bowed|adj.|弯曲的 bowel|n.|肠 bower|n.|凉亭 bowl|n./v.|碗 bowlegged|adj.|弓形腿的 bowler|n.|投球手 bowlful|n.|一碗 bowline|n.|帆脚索 bowling|n.|保龄球 bowsprit|n.|船首斜桅 bowstring|n.|弓弦 boxcar|n.|货车 box|n./v.|盒子 boxer|n.|拳击手 boxing|n.|拳击 boxwood|n.|黄杨木 boy|n.|男孩 boycott|v./n.|抵制 boyfriend|n.|男朋友 boyhood|n.|童年 boyish|adj.|男孩气的 boyishly|adv.|男孩气地 boyishness|n.|男孩气 boyhood|n.|童年 boyhoods|n.|童年
`.trim();

fillerWords.split(/\s+/).forEach(token => {
  token = token.trim();
  if (!token) return;
  const match = token.match(/^(\S+)\|([^|]+)\|(.+)$/);
  if (match) {
    const [, word, pos, def] = match;
    if (!allWords.has(word.toLowerCase())) {
      allWords.set(word.toLowerCase(), { word, phonetic: '', pos, def });
    }
  }
});
console.log('Total words after filler:', allWords.size);

// 6.5 批量补充音标
const phoneticDict = require('./phonetic-dict');
const prefixPhonetics = {
  'un': '/ʌn/', 're': '/riː/', 'dis': '/dɪs/', 'pre': '/priː/',
  'mis': '/mɪs/', 'over': '/ˌoʊvər/', 'sub': '/sʌb/', 'inter': '/ˌɪntər/',
  'fore': '/fɔːr/', 'de': '/diː/', 'trans': '/trænz/', 'anti': '/ˌænti/',
  'mid': '/mɪd/', 'under': '/ˌʌndər/', 'out': '/aʊt/', 'counter': '/ˌkaʊntər/',
  'non': '/nɑːn/', 'semi': '/ˌsemi/', 'super': '/ˌsuːpər/', 'ultra': '/ˌʌltrə/',
};
let phoneticHits = 0;
let prefixPhoneticHits = 0;
allWords.forEach((entry, key) => {
  if (entry.phonetic) return; // already has phonetic
  // Direct dictionary lookup
  const lower = entry.word.toLowerCase();
  if (phoneticDict[lower]) {
    entry.phonetic = phoneticDict[lower];
    phoneticHits++;
    return;
  }
  // Try prefix decomposition
  for (const [prefix, prefixIPA] of Object.entries(prefixPhonetics)) {
    if (lower.startsWith(prefix) && lower.length > prefix.length + 2) {
      const root = lower.slice(prefix.length);
      if (phoneticDict[root]) {
        // Combine prefix IPA + root IPA (simplified concatenation)
        const rootIPA = phoneticDict[root];
        entry.phonetic = prefixIPA + rootIPA.replace(/^\//, '').replace(/\/$/, '');
        // Wrap in slashes
        if (!entry.phonetic.startsWith('/')) entry.phonetic = '/' + entry.phonetic;
        if (!entry.phonetic.endsWith('/')) entry.phonetic = entry.phonetic + '/';
        prefixPhoneticHits++;
        return;
      }
    }
  }
});
console.log(`Phonetic dictionary hits: ${phoneticHits} direct, ${prefixPhoneticHits} prefix-derived`);

// 6.6 基于拼写规则的近似音标生成器
const vowelMap = {
  'a':'æ','e':'ɛ','i':'ɪ','o':'ɑ','u':'ʌ',
  'ai':'eɪ','ay':'eɪ','ey':'eɪ','ei':'eɪ',
  'ee':'iː','ea':'iː','ie':'iː',
  'oo':'uː','ou':'aʊ','ow':'aʊ',
  'oi':'ɔɪ','oy':'ɔɪ',
  'au':'ɔː','aw':'ɔː',
};
const consMap = {
  'ch':'tʃ','sh':'ʃ','th':'θ','ph':'f','wh':'w',
  'ng':'ŋ','nk':'ŋk','ck':'k','ght':'t',
  'tion':'ʃən','sion':'ʒən','ture':'tʃər','sure':'ʒər',
  'cial':'ʃəl','tial':'ʃəl','cious':'ʃəs','tious':'ʃəs',
  'ness':'nəs','ment':'mənt','ful':'fəl','less':'ləs',
  'able':'əbəl','ible':'ɪbəl','ous':'əs','ious':'iəs',
  'ing':'ɪŋ','ery':'əri','ory':'ɔːri','ary':'əri',
  'ity':'ɪti','ize':'aɪz','ise':'aɪz','ify':'ɪfaɪ',
  'ward':'wərd','wise':'waɪz','like':'laɪk',
};

function approxPhonetic(word) {
  if (!word || word.length < 2) return '';
  let w = word.toLowerCase();
  // Handle common endings
  let suffix = '';
  const endings = [
    ['tion','ʃən'],['sion','ʒən'],['ture','tʃər'],['ness','nəs'],
    ['ment','mənt'],['able','əbəl'],['ible','ɪbəl'],['ing','ɪŋ'],
    ['ful','fəl'],['less','ləs'],['ous','əs'],['ious','iəs'],
    ['cial','ʃəl'],['tial','ʃəl'],['ery','əri'],['ory','ɔːri'],
    ['ary','əri'],['ity','ɪti'],['ize','aɪz'],['ise','aɪz'],
    ['ify','ɪfaɪ'],['ward','wərd'],['ally','əli'],['ly','li'],
    ['ed','d'],['er','ər'],['est','ɪst'],['al','əl'],
    ['ent','ənt'],['ant','ənt'],['ence','əns'],['ance','əns'],
    ['or','ər'],['ist','ɪst'],['ism','ɪzəm'],
  ];
  for (const [ending, ipa] of endings) {
    if (w.endsWith(ending) && w.length > ending.length + 1) {
      suffix = ipa;
      w = w.slice(0, -ending.length);
      break;
    }
  }
  // Simple consonant+vowel pattern approximation
  let result = '';
  let i = 0;
  while (i < w.length) {
    const ch = w[i];
    const next = w[i+1] || '';
    const digraph = ch + next;
    // Check digraphs
    if (vowelMap[digraph]) {
      result += vowelMap[digraph];
      i += 2;
    } else if (consMap[digraph]) {
      result += consMap[digraph];
      i += 2;
    } else if ('aeiou'.includes(ch)) {
      // Single vowel - check if word ends with 'e' (silent e pattern)
      if (w.endsWith('e') && !w.endsWith('ee') && i === w.length - 2) {
        // Long vowel
        const longV = {'a':'eɪ','e':'iː','i':'aɪ','o':'oʊ','u':'juː'};
        result += longV[ch] || vowelMap[ch];
      } else {
        result += vowelMap[ch] || ch;
      }
      i++;
    } else {
      // Consonant
      const cMap = {'b':'b','c':'k','d':'d','f':'f','g':'ɡ','h':'h','j':'dʒ','k':'k',
        'l':'l','m':'m','n':'n','p':'p','q':'k','r':'r','s':'s','t':'t',
        'v':'v','w':'w','x':'ks','y':'j','z':'z'};
      result += cMap[ch] || ch;
      i++;
    }
  }
  if (suffix) result += suffix;
  return '/' + result + '/';
}

let approxHits = 0;
allWords.forEach((entry) => {
  if (entry.phonetic) return;
  entry.phonetic = approxPhonetic(entry.word);
  if (entry.phonetic) approxHits++;
});
console.log(`Approx phonetic generated: ${approxHits}`);
const totalPhonetic = [...allWords.values()].filter(w => w.phonetic).length;
console.log(`Total words with phonetics: ${totalPhonetic} / ${allWords.size}`);

// 7. 排序并生成JSON (限制9000词)
const MAX_WORDS = 9000;
const sorted = [...allWords.values()]
  .sort((a, b) => a.word.toLowerCase().localeCompare(b.word.toLowerCase()))
  .slice(0, MAX_WORDS);

const output = sorted.map((w, i) => ({
  id: 't' + String(i + 1).padStart(4, '0'),
  word: w.word,
  phonetic_us: w.phonetic || '',
  pos: w.pos || '',
  definition: w.def || ''
}));

const outPath = path.join(__dirname, 'src', 'data', 'toefl-words.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`\n=== GENERATED ${output.length} words ===`);
console.log('Output:', outPath);
console.log('Size:', (fs.statSync(outPath).size / 1024).toFixed(1), 'KB');

// Validate
const unique = new Set(output.map(w => w.word.toLowerCase()));
console.log('Unique words:', unique.size);
if (unique.size < 9000) {
  console.log(`WARNING: Need ${9000 - unique.size} more words to reach 9000`);
}
