/* HS Code Toolbox — 精简精选数据库
   结构：6位国际码打底 + 美/中/欧国别细分与关税(范例口径，仅供参考)
   数据为示范性质，不构成税务/报关建议。发行版需以官方源(WCO/各国海关)核验扩充。
   仅用于学习与工具演示。 */
window.HS_DATA = [
  // 39 塑料
  { code6:"3907", name:"Polyacetals, other polyethers and epoxide resins", cnName:"聚缩醛、其他聚醚及环氧化物树脂",
    us:{ code:"3907.10.00", duty:"6.5%" }, cn:{ code:"39071000", duty:"6.5% (暂定6.5%)" }, eu:{ code:"3907100090", duty:"6.5%" } },
  { code6:"3901", name:"Polymers of ethylene in primary forms", cnName:"初级形状的乙烯聚合物",
    us:{ code:"3901.10.10", duty:"5.8%" }, cn:{ code:"39011000", duty:"6.5%" }, eu:{ code:"3901101000", duty:"6.5%" } },
  { code6:"3902", name:"Polymers of propylene in primary forms", cnName:"初级形状的丙烯聚合物",
    us:{ code:"3902.10.00", duty:"6.5%" }, cn:{ code:"39021000", duty:"6.5%" }, eu:{ code:"3902100000", duty:"6.5%" } },
  { code6:"3923", name:"Articles for the conveyance or packing of goods of plastics", cnName:"塑料制运输或包装货物用物品",
    us:{ code:"3923.21.00", duty:"3%" }, cn:{ code:"39232100", duty:"6.5%" }, eu:{ code:"3923210000", duty:"6.5%" } },

  // 44 木及木制品
  { code6:"4407", name:"Wood sawn or chipped lengthwise, sliced or peeled", cnName:"纵锯或刨切的木材",
    us:{ code:"4407.11.00", duty:"Free" }, cn:{ code:"44071100", duty:"0%" }, eu:{ code:"4407110000", duty:"0%" } },
  { code6:"4415", name:"Packing cases and similar of wood", cnName:"木制包装箱",
    us:{ code:"4415.10.30", duty:"2.9%" }, cn:{ code:"44151000", duty:"10% (暂定)" }, eu:{ code:"4415101000", duty:"1.7%" } },
  { code6:"4412", name:"Plywood, veneered panels and similar laminated wood", cnName:"胶合板",
    us:{ code:"4412.31.00", duty:"5.1%" }, cn:{ code:"44123100", duty:"4% (暂定)" }, eu:{ code:"4412311000", duty:"6.5%" } },

  // 48 纸与纸板
  { code6:"4802", name:"Uncoated paper and paperboard used for writing", cnName:"书写印刷未涂布纸",
    us:{ code:"4802.56.10", duty:"Free" }, cn:{ code:"48025600", duty:"0%" }, eu:{ code:"4802560000", duty:"0%" } },
  { code6:"4819", name:"Cartons, boxes, cases of paper and paperboard", cnName:"纸或纸板制的箱盒",
    us:{ code:"4819.10.00", duty:"2.6%" }, cn:{ code:"48191000", duty:"7.5%" }, eu:{ code:"4819100000", duty:"5.5%" } },

  // 61 针织服装
  { code6:"6110", name:"Jerseys, pullovers, cardigans of textile (knitted)", cnName:"针织套头衫、开襟衫",
    us:{ code:"6110.30.30", duty:"32%" }, cn:{ code:"61103000", duty:"9%" }, eu:{ code:"6110309100", duty:"12%" } },

  // 63 其他纺织制成品
  { code6:"6302", name:"Bed linen, table linen, toilet and kitchen linen", cnName:"床上用品、餐桌用品",
    us:{ code:"6302.21.90", duty:"5.7%" }, cn:{ code:"63022100", duty:"7.5%" }, eu:{ code:"6302210000", duty:"12%" } },

  // 64 鞋靴
  { code6:"6403", name:"Footwear with outer soles of rubber/plastics/leather", cnName:"皮革/橡胶/塑料制外底鞋靴",
    us:{ code:"6403.99.60", duty:"8.5% + 1.2$/pr" }, cn:{ code:"64039900", duty:"10%" }, eu:{ code:"6403999100", duty:"7.5%" } },

  // 73 钢铁制品
  { code6:"7326", name:"Other articles of iron or steel", cnName:"其他钢铁制品",
    us:{ code:"7326.20.00", duty:"2.9%" }, cn:{ code:"73262000", duty:"7.5%" }, eu:{ code:"7326200090", duty:"2.7%" } },
  { code6:"7318", name:"Screws, bolts, nuts and similar articles of iron/steel", cnName:"钢铁制螺钉、螺栓、螺母",
    us:{ code:"7318.15.40", duty:"4.2%" }, cn:{ code:"73181500", duty:"8% (暂定)" }, eu:{ code:"7318151030", duty:"2.7%" } },

  // 82 贱金属工具
  { code6:"8205", name:"Hand tools of base metal", cnName:"贱金属手工工具",
    us:{ code:"8205.70.00", duty:"6.2%" }, cn:{ code:"82057000", duty:"8%" }, eu:{ code:"8205700000", duty:"2.7%" } },

  // 84 机械设备
  { code6:"8407", name:"Spark-ignition internal combustion engines", cnName:"点燃式内燃活塞发动机",
    us:{ code:"8407.34.10", duty:"2.5%" }, cn:{ code:"84073400", duty:"8% (暂定)" }, eu:{ code:"8407340000", duty:"2.7%" } },
  { code6:"8479", name:"Machines and mechanical appliances having individual functions", cnName:"单独功能的其他机械",
    us:{ code:"8479.82.00", duty:"2.5%" }, cn:{ code:"84798200", duty:"5% (暂定)" }, eu:{ code:"8479820000", duty:"2.7%" } },
  { code6:"8467", name:"Tools for working in the hand, with self-contained motor", cnName:"自带电动机的手提式工具",
    us:{ code:"8467.21.00", duty:"4% + 2.6A" }, cn:{ code:"84672100", duty:"5%" }, eu:{ code:"8467211000", duty:"2.7%" } },

  // 85 电气设备
  { code6:"8517", name:"Telephone sets and other apparatus for transmitting voice/images", cnName:"电话机及其他语音/图像传输设备",
    us:{ code:"8517.62.00", duty:"Free" }, cn:{ code:"85176200", duty:"0%" }, eu:{ code:"8517620000", duty:"Free" } },
  { code6:"8536", name:"Electrical apparatus for switching or protecting circuits", cnName:"电路开关及保护装置",
    us:{ code:"8536.50.90", duty:"2.7%" }, cn:{ code:"85365000", duty:"5%" }, eu:{ code:"8536508000", duty:"2.7%" } },
  { code6:"8504", name:"Transformers, static converters and inductors", cnName:"变压器、静止式变流器",
    us:{ code:"8504.40.95", duty:"1.5%" }, cn:{ code:"85044000", duty:"5%" }, eu:{ code:"8504403000", duty:"Free" } },
  { code6:"8518", name:"Microphones, loudspeakers, headphones", cnName:"麦克风、扬声器、耳机",
    us:{ code:"8518.30.20", duty:"4.9%" }, cn:{ code:"85183000", duty:"10%" }, eu:{ code:"8518300010", duty:"2.7%" } },

  // 87 车辆
  { code6:"8711", name:"Motorcycles and cycles with auxiliary motor", cnName:"摩托车及装有辅助发动机的脚踏车",
    us:{ code:"8711.20.00", duty:"Free" }, cn:{ code:"87112000", duty:"15%" }, eu:{ code:"8711201000", duty:"Free" } },

  // 90 光学/医疗
  { code6:"9018", name:"Instruments and appliances used in medical or surgical sciences", cnName:"医疗外科用仪器及器具",
    us:{ code:"9018.90.75", duty:"Free" }, cn:{ code:"90189000", duty:"4%" }, eu:{ code:"9018908400", duty:"Free" } },

  // 95 玩具
  { code6:"9503", name:"Toys, models and similar recreational articles", cnName:"玩具及模型",
    us:{ code:"9503.00.00", duty:"0%" }, cn:{ code:"95030021", duty:"0% (暂定)" }, eu:{ code:"9503001000", duty:"2.7%" } },

  // 08 水果
  { code6:"0808", name:"Apples, pears and quinces, fresh", cnName:"鲜苹果、梨",
    us:{ code:"0808.10.00", duty:"Free" }, cn:{ code:"08081000", duty:"0%" }, eu:{ code:"0808108000", duty:"Free" } },

  // 09 咖啡茶
  { code6:"0901", name:"Coffee, roasted or unroasted", cnName:"咖啡",
    us:{ code:"0901.11.00", duty:"Free" }, cn:{ code:"09011100", duty:"8%" }, eu:{ code:"0901110000", duty:"Free" } }
];

/* 品名关键词 → 映射到 code6 (英文+中文双查) */
window.HS_ALIAS = [
  { kw:["pvc","resin","plastic","polyacetal","polyether","epoxide"], code:"3907" },
  { kw:["polyethylene","plastic-polymer"], code:"3901" },
  { kw:["polypropylene","plastic-polymer"], code:"3902" },
  { kw:["plastic box","plastic bag","packaging","plastic case","packing"], code:"3923" },
  { kw:["wood","timber","sawn","lumber"], code:"4407" },
  { kw:["wooden case","wooden box","packing case","wood box"], code:"4415" },
  { kw:["plywood","veneer","laminated"], code:"4412" },
  { kw:["paper","writing paper","printer paper"], code:"4802" },
  { kw:["carton","cardboard-box","paper-box","corrugated"], code:"4819" },
  { kw:["sweater","pullover","cardigan","jersey","knit"], code:"6110" },
  { kw:["bedding","bed linen","tablecloth","pillowcase","linen"], code:"6302" },
  { kw:["shoes","footwear","leather shoes","boots","sneaker"], code:"6403" },
  { kw:["steel part","steel article","metal article","iron article"], code:"7326" },
  { kw:["screw","bolt","nut","fastener","washer"], code:"7318" },
  { kw:["hand tool","wrench","pliers","hammer","tool"], code:"8205" },
  { kw:["engine","motor","generator engine","ic engine"], code:"8407" },
  { kw:["machine","machinery","mechanical appliance"], code:"8479" },
  { kw:["power tool","drill","sander","hand drill"], code:"8467" },
  { kw:["phone","telephone","router","modem","switch","apparatus"], code:"8517" },
  { kw:["electrical switch","circuit breaker","relay","switchgear"], code:"8536" },
  { kw:["transformer","charger","power supply","adapter","inductor"], code:"8504" },
  { kw:["speaker","microphone","headphone","earphone","audio"], code:"8518" },
  { kw:["motorcycle","motorbike","scooter","bike"], code:"8711" },
  { kw:["medical","surgical","medical device","instrument"], code:"9018" },
  { kw:["toy","model","doll","action figure","recreational"], code:"9503" },
  { kw:["apple","pear","quince","fruit","fresh fruit"], code:"0808" },
  { kw:["coffee","roasted coffee","bean","coffee bean"], code:"0901" },

  // 中文关键词
  { kw:["塑料","树脂","聚缩醛","聚合"], code:"3907" },
  { kw:["聚乙烯","塑胶","塑料"], code:"3901" },
  { kw:["聚丙烯","塑胶"], code:"3902" },
  { kw:["塑料箱","塑料袋","包装","塑料盒"], code:"3923" },
  { kw:["木材","原木","锯材","板材"], code:"4407" },
  { kw:["木箱","木制包装"], code:"4415" },
  { kw:["胶合板","三合板","贴面板"], code:"4412" },
  { kw:["纸","书写纸","打印纸"], code:"4802" },
  { kw:["纸箱","纸盒","瓦楞","包装箱","盒子"], code:"4819" },
  { kw:["毛衣","开衫","针织衫","套头衫"], code:"6110" },
  { kw:["床上用品","床单","桌布","枕套"], code:"6302" },
  { kw:["鞋","皮鞋","运动鞋","靴子","鞋类"], code:"6403" },
  { kw:["钢铁制品","五金件","金属件"], code:"7326" },
  { kw:["螺丝","螺栓","螺母","螺丝钉","垫圈"], code:"7318" },
  { kw:["手工工具","扳手","钳子","锤子","工具"], code:"8205" },
  { kw:["发动机","引擎","马达"], code:"8407" },
  { kw:["机械","机器","设备"], code:"8479" },
  { kw:["电动工具","电钻","砂光机","手钻"], code:"8467" },
  { kw:["电话","路由器","交换机","设备"], code:"8517" },
  { kw:["开关","断路器","继电器"], code:"8536" },
  { kw:["变压器","充电器","电源","适配器"], code:"8504" },
  { kw:["扬声器","麦克风","耳机","音响"], code:"8518" },
  { kw:["摩托车","踏板车","摩托"], code:"8711" },
  { kw:["医疗","医用","医疗器械","手术"], code:"9018" },
  { kw:["玩具","模型","玩偶","手办"], code:"9503" },
  { kw:["苹果","梨","水果"], code:"0808" },
  { kw:["咖啡","咖啡豆"], code:"0901" }
];