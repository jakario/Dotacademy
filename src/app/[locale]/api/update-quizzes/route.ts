import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const SECTIONS = [
  { id: 'cmsr6jrd5000467gwt1ljjw5v', title: 'แบบทดสอบ ตอนที่ 1: ภารกิจหลักและกฎหมายจัดตั้ง' },
  { id: 'cmsr6jrd5000667gwqg4yrvbn', title: 'แบบทดสอบ ตอนที่ 2: กองทะเบียนธุรกิจนำเที่ยวและมัคคุเทศก์' },
  { id: 'cmsr6jrd5000767gwswe3f5hr', title: 'แบบทดสอบ ตอนที่ 3: กองพัฒนาแหล่งท่องเที่ยว' },
  { id: 'cmsr6jrd5000867gw1mkkwvgq', title: 'แบบทดสอบ ตอนที่ 4: กองพัฒนาบริการท่องเที่ยว' },
  { id: 'cmsr6jrd5000967gwgp99snps', title: 'แบบทดสอบ ตอนที่ 5: กองพัฒนามาตรฐานบุคลากรด้านการท่องเที่ยว' },
  { id: 'cmsr6jrd5000a67gwm0mift7m', title: 'แบบทดสอบ ตอนที่ 6: กองกิจการภาพยนตร์และวีดิทัศน์ต่างประเทศ' },
  { id: 'cmt2cx7nl0004nit3bdk23w1v', title: 'แบบทดสอบ ตอนที่ 7: กลุ่มตรวจสอบภายใน' },
  { id: 'cmt2o62a5000214i7pcot07rw', title: 'แบบทดสอบ ตอนที่ 8: กลุ่มงานจริยธรรม' },
  { id: 'cmt2pybxo000111rjn2acqyzl', title: 'แบบทดสอบ ตอนที่ 9: สำนักงานเลขานุการกรม' },
  { id: 'cmsr6jrd5000567gwxunbrin6', title: 'แบบทดสอบ ตอนที่ 10: กลุ่มพัฒนาระบบบริหาร' },
];

const QUIZ_DATA = [
  // Section 1
  {
    sectionIdx: 0,
    questions: [
      {
        text: 'กรมการท่องเที่ยว สังกัดกระทรวงใด?',
        options: [
          { text: 'กระทรวงมหาดไทย', isCorrect: false },
          { text: 'กระทรวงวัฒนธรรม', isCorrect: false },
          { text: 'กระทรวงการท่องเที่ยวและกีฬา', isCorrect: true },
          { text: 'กระทรวงพาณิชย์', isCorrect: false },
        ],
      },
      {
        text: 'ภารกิจหลักที่สำคัญที่สุดของกรมการท่องเที่ยวคือเรื่องใด?',
        options: [
          { text: 'การเก็บภาษีนักท่องเที่ยว', isCorrect: false },
          { text: 'การพัฒนามาตรฐานบริการ แหล่งท่องเที่ยว และธุรกิจนำเที่ยว', isCorrect: true },
          { text: 'การสร้างสนามบินแห่งใหม่', isCorrect: false },
          { text: 'การพิจารณาวีซ่านักท่องเที่ยว', isCorrect: false },
        ],
      },
      {
        text: 'กฎหมายใดเป็นกฎหมายหลักที่กรมการท่องเที่ยวใช้ในการกำกับดูแล?',
        options: [
          { text: 'พ.ร.บ. คุ้มครองผู้บริโภค', isCorrect: false },
          { text: 'พ.ร.บ. ธุรกิจนำเที่ยวและมัคคุเทศก์', isCorrect: true },
          { text: 'พ.ร.บ. โรงแรม', isCorrect: false },
          { text: 'พ.ร.บ. ควบคุมอาคาร', isCorrect: false },
        ],
      },
      {
        text: 'การแบ่งส่วนราชการของกรมการท่องเที่ยว กำหนดโดยกฎหมายระดับใด?',
        options: [
          { text: 'พระราชบัญญัติ', isCorrect: false },
          { text: 'กฎกระทรวง', isCorrect: true },
          { text: 'ประกาศกระทรวง', isCorrect: false },
          { text: 'ระเบียบกรม', isCorrect: false },
        ],
      },
      {
        text: 'ข้อใด ไม่ใช่ บทบาทของกรมการท่องเที่ยว?',
        options: [
          { text: 'พัฒนาแหล่งท่องเที่ยว', isCorrect: false },
          { text: 'ออกใบอนุญาตมัคคุเทศก์', isCorrect: false },
          { text: 'ทำการตลาดโปรโมทการท่องเที่ยวในต่างประเทศ', isCorrect: true },
          { text: 'ส่งเสริมการถ่ายทำภาพยนตร์ต่างประเทศในไทย', isCorrect: false },
        ],
      },
    ],
  },
  // Section 2
  {
    sectionIdx: 1,
    questions: [
      {
        text: 'หากต้องการเปิดบริษัททัวร์ ต้องติดต่อหน่วยงานใดก่อน?',
        options: [
          { text: 'กองพัฒนาแหล่งท่องเที่ยว', isCorrect: false },
          { text: 'กองทะเบียนธุรกิจนำเที่ยวและมัคคุเทศก์', isCorrect: true },
          { text: 'สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา', isCorrect: false },
          { text: 'กรมพัฒนาธุรกิจการค้า', isCorrect: false },
        ],
      },
      {
        text: 'ใบอนุญาตเป็นมัคคุเทศก์ (ไกด์) ต้องต่ออายุทุกๆ กี่ปี?',
        options: [
          { text: '1 ปี', isCorrect: false },
          { text: '2 ปี', isCorrect: false },
          { text: '3 ปี', isCorrect: false },
          { text: '5 ปี', isCorrect: true },
        ],
      },
      {
        text: '"กองทุนคุ้มครองธุรกิจนำเที่ยว" อยู่ภายใต้การดูแลของส่วนงานใด?',
        options: [
          { text: 'กองทะเบียนธุรกิจนำเที่ยวและมัคคุเทศก์', isCorrect: true },
          { text: 'กลุ่มตรวจสอบภายใน', isCorrect: false },
          { text: 'กองพัฒนาบริการท่องเที่ยว', isCorrect: false },
          { text: 'กองทุนเงินให้กู้ยืมเพื่อการศึกษา', isCorrect: false },
        ],
      },
      {
        text: 'ผู้ใดมีอำนาจสั่งเพิกถอนใบอนุญาตประกอบธุรกิจนำเที่ยวหากทำผิดกฎหมายร้ายแรง?',
        options: [
          { text: 'นายกรัฐมนตรี', isCorrect: false },
          { text: 'รัฐมนตรีว่าการกระทรวงการท่องเที่ยวและกีฬา', isCorrect: false },
          { text: 'นายทะเบียนธุรกิจนำเที่ยวและมัคคุเทศก์', isCorrect: true },
          { text: 'ผู้อำนวยการ ททท.', isCorrect: false },
        ],
      },
      {
        text: 'อาชีพมัคคุเทศก์ในประเทศไทยสงวนไว้สำหรับบุคคลกลุ่มใด?',
        options: [
          { text: 'สัญชาติใดก็ได้ที่พูดภาษาไทยได้', isCorrect: false },
          { text: 'ผู้ที่มีสัญชาติไทยเท่านั้น', isCorrect: true },
          { text: 'ผู้ที่มีใบอนุญาตทำงาน (Work Permit)', isCorrect: false },
          { text: 'ผู้ที่เรียนจบปริญญาตรีด้านการท่องเที่ยวเท่านั้น', isCorrect: false },
        ],
      },
    ],
  },
  // Section 3
  {
    sectionIdx: 2,
    questions: [
      {
        text: 'กองพัฒนาแหล่งท่องเที่ยว มีหน้าที่หลักในเรื่องใด?',
        options: [
          { text: 'ตรวจสอบภาษีโรงแรม', isCorrect: false },
          { text: 'พัฒนา ฟื้นฟู และยกระดับมาตรฐานแหล่งท่องเที่ยว', isCorrect: true },
          { text: 'จับกุมไกด์เถื่อน', isCorrect: false },
          { text: 'ออกใบอนุญาตธุรกิจนำเที่ยว', isCorrect: false },
        ],
      },
      {
        text: 'แผนพัฒนาการท่องเที่ยวแห่งชาติ มุ่งเน้นการพัฒนาแหล่งท่องเที่ยวแบบใดในปัจจุบัน?',
        options: [
          { text: 'การท่องเที่ยวเชิงอุตสาหกรรม', isCorrect: false },
          { text: 'การท่องเที่ยวที่ยั่งยืนและเป็นมิตรกับสิ่งแวดล้อม (BCG)', isCorrect: true },
          { text: 'การท่องเที่ยวแบบคาสิโน', isCorrect: false },
          { text: 'การท่องเที่ยวอวกาศ', isCorrect: false },
        ],
      },
      {
        text: 'ข้อใดคือตัวอย่างมาตรฐานที่กองพัฒนาแหล่งท่องเที่ยวเป็นผู้ดูแล?',
        options: [
          { text: 'มาตรฐานห้องน้ำสาธารณะเพื่อการท่องเที่ยว', isCorrect: true },
          { text: 'มาตรฐานรถทัวร์', isCorrect: false },
          { text: 'มาตรฐานร้านอาหาร', isCorrect: false },
          { text: 'มาตรฐานสายการบิน', isCorrect: false },
        ],
      },
      {
        text: 'โครงการ "ชุมชนท่องเที่ยว OTOP นวัตวิถี" ต้องทำงานบูรณาการร่วมกับหน่วยงานใดมากที่สุด?',
        options: [
          { text: 'กรมการพัฒนาชุมชน', isCorrect: true },
          { text: 'กรมสรรพากร', isCorrect: false },
          { text: 'กรมศุลกากร', isCorrect: false },
          { text: 'กรมทางหลวง', isCorrect: false },
        ],
      },
      {
        text: 'เครื่องหมายรับรองมาตรฐานแหล่งท่องเที่ยวของไทย มีอายุการรับรองกี่ปี?',
        options: [
          { text: '1 ปี', isCorrect: false },
          { text: '2 ปี', isCorrect: false },
          { text: '3 ปี', isCorrect: true },
          { text: 'ตลอดชีพ', isCorrect: false },
        ],
      },
    ],
  },
  // Section 4
  {
    sectionIdx: 3,
    questions: [
      {
        text: 'หน่วยงานใดมีหน้าที่กำกับดูแลมาตรฐาน "ที่พักนักเดินทาง (Home Lodge)"?',
        options: [
          { text: 'กองทะเบียนธุรกิจนำเที่ยวและมัคคุเทศก์', isCorrect: false },
          { text: 'กองพัฒนาบริการท่องเที่ยว', isCorrect: true },
          { text: 'สำนักงานตำรวจแห่งชาติ', isCorrect: false },
          { text: 'กองกิจการภาพยนตร์และวีดิทัศน์ต่างประเทศ', isCorrect: false },
        ],
      },
      {
        text: 'การพัฒนาบริการท่องเที่ยว ครอบคลุมถึงเรื่องใด?',
        options: [
          { text: 'มาตรฐานที่พักและโฮมสเตย์ไทย', isCorrect: false },
          { text: 'มาตรฐานร้านอาหารเพื่อการท่องเที่ยว', isCorrect: false },
          { text: 'มาตรฐานสปาและการนวดเพื่อสุขภาพ', isCorrect: false },
          { text: 'ถูกทุกข้อ', isCorrect: true },
        ],
      },
      {
        text: 'ตราสัญลักษณ์ "ช้างชูงวงเริงร่า" เป็นสัญลักษณ์ของสิ่งใด?',
        options: [
          { text: 'มาตรฐานการท่องเที่ยวไทย (Thailand Tourism Standard)', isCorrect: true },
          { text: 'ธุรกิจนำเที่ยวที่จดทะเบียนถูกต้อง', isCorrect: false },
          { text: 'สมาคมมัคคุเทศก์', isCorrect: false },
          { text: 'กรมการท่องเที่ยว', isCorrect: false },
        ],
      },
      {
        text: 'วัตถุประสงค์ของการรับรองมาตรฐานโฮมสเตย์ไทยคืออะไร?',
        options: [
          { text: 'เพื่อจัดเก็บภาษีได้มากขึ้น', isCorrect: false },
          { text: 'เพื่อยกระดับคุณภาพชีวิตและกระจายรายได้สู่ชุมชน', isCorrect: true },
          { text: 'เพื่อให้บริษัทต่างชาติเข้ามาลงทุน', isCorrect: false },
          { text: 'เพื่อแข่งขันกับโรงแรม 5 ดาว', isCorrect: false },
        ],
      },
      {
        text: 'สิ่งอำนวยความสะดวกสำหรับคนพิการ (Tourism for All) อยู่ในความรับผิดชอบของส่วนงานใดในการผลักดันมาตรฐาน?',
        options: [
          { text: 'กองพัฒนาบริการท่องเที่ยว', isCorrect: true },
          { text: 'กองทะเบียนธุรกิจนำเที่ยว', isCorrect: false },
          { text: 'กลุ่มงานจริยธรรม', isCorrect: false },
          { text: 'สำนักงานเลขานุการกรม', isCorrect: false },
        ],
      },
    ],
  },
  // Section 5
  {
    sectionIdx: 4,
    questions: [
      {
        text: 'กองพัฒนามาตรฐานบุคลากรฯ มุ่งเน้นพัฒนาบุคลากรกลุ่มใดเป็นหลัก?',
        options: [
          { text: 'ข้าราชการครู', isCorrect: false },
          { text: 'บุคลากรทางการแพทย์', isCorrect: false },
          { text: 'มัคคุเทศก์และผู้ให้บริการด้านการท่องเที่ยว', isCorrect: true },
          { text: 'พนักงานธนาคาร', isCorrect: false },
        ],
      },
      {
        text: 'ข้อใดคือภารกิจสำคัญของกองพัฒนามาตรฐานบุคลากรฯ?',
        options: [
          { text: 'จัดทำหลักสูตรฝึกอบรมมัคคุเทศก์', isCorrect: true },
          { text: 'สร้างสถานที่ท่องเที่ยวใหม่', isCorrect: false },
          { text: 'ออกพาสปอร์ตให้นักท่องเที่ยว', isCorrect: false },
          { text: 'อนุมัติงบประมาณจังหวัด', isCorrect: false },
        ],
      },
      {
        text: 'การทดสอบความรู้ความสามารถเพื่อขอรับใบอนุญาตเป็นมัคคุเทศก์ ต้องผ่านการประเมินจากหน่วยงานใด?',
        options: [
          { text: 'กรมการจัดหางาน', isCorrect: false },
          { text: 'สถาบันการศึกษาที่ได้รับมอบหมายร่วมกับกรมการท่องเที่ยว', isCorrect: true },
          { text: 'สมาคมโรงแรมไทย', isCorrect: false },
          { text: 'ตำรวจท่องเที่ยว', isCorrect: false },
        ],
      },
      {
        text: 'ผู้ที่จะเป็น "ผู้นำเที่ยว (Tour Leader)" ต้องมีคุณสมบัติเบื้องต้นอย่างไร?',
        options: [
          { text: 'ต้องจบปริญญาโท', isCorrect: false },
          { text: 'ต้องมีสัญชาติไทยและอายุไม่ต่ำกว่า 18 ปี', isCorrect: true },
          { text: 'ต้องพูดได้ 3 ภาษา', isCorrect: false },
          { text: 'ต้องเคยเดินทางไปต่างประเทศมาก่อน', isCorrect: false },
        ],
      },
      {
        text: 'กองพัฒนามาตรฐานบุคลากรฯ สนับสนุนการเรียนรู้ผ่านช่องทางใดในปัจจุบันเพื่อความครอบคลุม?',
        options: [
          { text: 'การอบรมในห้องเรียนเท่านั้น', isCorrect: false },
          { text: 'การส่งจดหมายทางไปรษณีย์', isCorrect: false },
          { text: 'แพลตฟอร์มการเรียนรู้ออนไลน์ (e-Learning) เช่น DOT Academy', isCorrect: true },
          { text: 'การเรียนผ่านวิทยุชุมชน', isCorrect: false },
        ],
      },
    ],
  },
  // Section 6
  {
    sectionIdx: 5,
    questions: [
      {
        text: 'กองกิจการภาพยนตร์ฯ มีชื่อเรียกในภาษาอังกฤษว่าอะไร?',
        options: [
          { text: 'Thai Movie Center', isCorrect: false },
          { text: 'Thailand Film Office (TFO)', isCorrect: true },
          { text: 'Bangkok Film Board', isCorrect: false },
          { text: 'Department of Cinema', isCorrect: false },
        ],
      },
      {
        text: 'หน้าที่หลักของกองกิจการภาพยนตร์ฯ คืออะไร?',
        options: [
          { text: 'เซ็นเซอร์ภาพยนตร์ไทยก่อนฉาย', isCorrect: false },
          { text: 'ส่งเสริมและพิจารณาอนุญาตการถ่ายทำภาพยนตร์ต่างประเทศในไทย', isCorrect: true },
          { text: 'จัดงานประกาศรางวัลออสการ์', isCorrect: false },
          { text: 'ผลิตละครโทรทัศน์', isCorrect: false },
        ],
      },
      {
        text: 'มาตรการคืนเงิน (Cash Rebate) สำหรับกองถ่ายทำภาพยนตร์ต่างประเทศ มีวัตถุประสงค์เพื่ออะไร?',
        options: [
          { text: 'จ่ายค่าชดเชยให้ชาวบ้าน', isCorrect: false },
          { text: 'ดึงดูดเม็ดเงินลงทุนและกระตุ้นเศรษฐกิจจากการถ่ายทำภาพยนตร์', isCorrect: true },
          { text: 'ให้ทุนนักศึกษาทำหนังสั้น', isCorrect: false },
          { text: 'เป็นเงินบริจาคเข้ากองทุน', isCorrect: false },
        ],
      },
      {
        text: 'ผู้ประสานงานการถ่ายทำภาพยนตร์ต่างประเทศในประเทศไทย เรียกว่าอะไร?',
        options: [
          { text: 'Director', isCorrect: false },
          { text: 'Local Coordinator (ผู้ประสานงานในประเทศ)', isCorrect: true },
          { text: 'Actor', isCorrect: false },
          { text: 'Cameraman', isCorrect: false },
        ],
      },
      {
        text: 'การเข้ามาถ่ายทำภาพยนตร์ต่างประเทศในไทย ช่วยส่งเสริมการท่องเที่ยวรูปแบบใดมากที่สุด?',
        options: [
          { text: 'Film-induced Tourism (การท่องเที่ยวตามรอยภาพยนตร์)', isCorrect: true },
          { text: 'Medical Tourism (การท่องเที่ยวเชิงการแพทย์)', isCorrect: false },
          { text: 'Ecotourism (การท่องเที่ยวเชิงนิเวศ)', isCorrect: false },
          { text: 'Business Tourism (การท่องเที่ยวเชิงธุรกิจ)', isCorrect: false },
        ],
      },
    ],
  },
  // Section 7
  {
    sectionIdx: 6,
    questions: [
      {
        text: 'กลุ่มตรวจสอบภายใน (Internal Audit) ขึ้นตรงต่อผู้ใด?',
        options: [
          { text: 'รัฐมนตรีว่าการกระทรวงฯ', isCorrect: false },
          { text: 'ปลัดกระทรวง', isCorrect: false },
          { text: 'อธิบดีกรมการท่องเที่ยว', isCorrect: true },
          { text: 'ผู้อำนวยการกองคลัง', isCorrect: false },
        ],
      },
      {
        text: 'วัตถุประสงค์หลักของการตรวจสอบภายในคืออะไร?',
        options: [
          { text: 'จับผิดข้าราชการ', isCorrect: false },
          { text: 'ให้ความเชื่อมั่นและให้คำปรึกษาเพื่อเพิ่มคุณค่าและปรับปรุงการปฏิบัติงาน', isCorrect: true },
          { text: 'ลดเงินเดือนพนักงาน', isCorrect: false },
          { text: 'แย่งงานสำนักงานการตรวจเงินแผ่นดิน (สตง.)', isCorrect: false },
        ],
      },
      {
        text: 'การตรวจสอบของกลุ่มตรวจสอบภายใน ครอบคลุมเรื่องใดบ้าง?',
        options: [
          { text: 'การใช้จ่ายงบประมาณ', isCorrect: false },
          { text: 'การปฏิบัติตามระเบียบและกฎหมาย', isCorrect: false },
          { text: 'ประสิทธิภาพและประสิทธิผลของโครงการ', isCorrect: false },
          { text: 'ถูกทุกข้อ', isCorrect: true },
        ],
      },
      {
        text: 'กลุ่มตรวจสอบภายใน ทำงานประสานงานกับหน่วยงานภายนอกใดมากที่สุดในด้านบัญชีและงบประมาณ?',
        options: [
          { text: 'กรมสรรพากร', isCorrect: false },
          { text: 'สำนักงานการตรวจเงินแผ่นดิน (สตง.)', isCorrect: true },
          { text: 'กรมศุลกากร', isCorrect: false },
          { text: 'ธนาคารแห่งประเทศไทย', isCorrect: false },
        ],
      },
      {
        text: 'ข้อใดคือจรรยาบรรณที่สำคัญที่สุดของผู้ตรวจสอบภายใน?',
        options: [
          { text: 'ความซื่อสัตย์และความเที่ยงธรรม', isCorrect: true },
          { text: 'ความมีมนุษยสัมพันธ์', isCorrect: false },
          { text: 'ความสามารถในการนำเสนอ', isCorrect: false },
          { text: 'ความคิดสร้างสรรค์', isCorrect: false },
        ],
      },
    ],
  },
  // Section 8
  {
    sectionIdx: 7,
    questions: [
      {
        text: 'กลุ่มงานจริยธรรม มีบทบาทหน้าที่สำคัญในเรื่องใด?',
        options: [
          { text: 'การประเมินผลการปฏิบัติราชการ (เงินเดือน)', isCorrect: false },
          { text: 'ส่งเสริมคุณธรรม จริยธรรม และการป้องกันการทุจริตประพฤติมิชอบ', isCorrect: true },
          { text: 'การจัดซื้อจัดจ้าง', isCorrect: false },
          { text: 'การเบิกจ่ายงบประมาณ', isCorrect: false },
        ],
      },
      {
        text: '"การประเมิน ITA" (Integrity and Transparency Assessment) มีวัตถุประสงค์เพื่ออะไร?',
        options: [
          { text: 'ประเมินศักยภาพการท่องเที่ยว', isCorrect: false },
          { text: 'ประเมินความโปร่งใสและธรรมาภิบาลของหน่วยงานภาครัฐ', isCorrect: true },
          { text: 'ประเมินผลการปฏิบัติงานบุคลากรรายปี', isCorrect: false },
          { text: 'ประเมินการใช้จ่ายงบประมาณ', isCorrect: false },
        ],
      },
      {
        text: 'ข้อใดคือพฤติกรรมที่ขัดต่อมาตรฐานทางจริยธรรมของเจ้าหน้าที่รัฐ?',
        options: [
          { text: 'การให้บริการประชาชนด้วยความเสมอภาค', isCorrect: false },
          { text: 'การนำรถยนต์ราชการไปใช้ในกิจธุระส่วนตัว', isCorrect: true },
          { text: 'การเข้ารับการฝึกอบรมพัฒนาตนเอง', isCorrect: false },
          { text: 'การประหยัดพลังงานในสำนักงาน', isCorrect: false },
        ],
      },
      {
        text: 'หากพบเห็นการทุจริตในหน่วยงาน ควรแจ้งเบาะแสผ่านช่องทางใดที่ปลอดภัยและเป็นทางการที่สุด?',
        options: [
          { text: 'โพสต์ลง Facebook ส่วนตัว', isCorrect: false },
          { text: 'ร้องเรียนผ่านศูนย์ปฏิบัติการต่อต้านการทุจริต (ศปท.) หรือช่องทางรับเรื่องร้องเรียนของกรม', isCorrect: true },
          { text: 'บอกเพื่อนร่วมงาน', isCorrect: false },
          { text: 'ส่งจดหมายสนเท่ห์แบบไม่มีหลักฐาน', isCorrect: false },
        ],
      },
      {
        text: 'นโยบาย "No Gift Policy" หมายถึงอะไร?',
        options: [
          { text: 'ห้ามข้าราชการซื้อของขวัญให้คนในครอบครัว', isCorrect: false },
          { text: 'งดรับงดให้ของขวัญและของกำนัลทุกชนิดจากการปฏิบัติหน้าที่', isCorrect: true },
          { text: 'ห้ามแจกของขวัญในงานวันเด็ก', isCorrect: false },
          { text: 'ห้ามรับบริจาคเงินเข้ามูลนิธิ', isCorrect: false },
        ],
      },
    ],
  },
  // Section 9
  {
    sectionIdx: 8,
    questions: [
      {
        text: 'สำนักงานเลขานุการกรม มีลักษณะการทำงานแบบใด?',
        options: [
          { text: 'เป็นหน่วยงานที่ลงพื้นที่พัฒนาแหล่งท่องเที่ยว', isCorrect: false },
          { text: 'เป็นหน่วยงานสนับสนุน (Back Office) ดูแลงานบริหารทั่วไปของกรม', isCorrect: true },
          { text: 'เป็นหน่วยงานออกใบอนุญาตมัคคุเทศก์', isCorrect: false },
          { text: 'เป็นหน่วยงานปราบปรามทัวร์ศูนย์เหรียญ', isCorrect: false },
        ],
      },
      {
        text: 'งานด้านใดที่ อยู่ใน ความรับผิดชอบของสำนักงานเลขานุการกรม?',
        options: [
          { text: 'งานสารบรรณ (รับ-ส่งหนังสือราชการ)', isCorrect: true },
          { text: 'งานจัดทำหลักสูตรอบรมไกด์', isCorrect: false },
          { text: 'งานตรวจประเมินโฮมสเตย์', isCorrect: false },
          { text: 'งานพิจารณาบทภาพยนตร์ต่างประเทศ', isCorrect: false },
        ],
      },
      {
        text: 'การประชาสัมพันธ์องค์กรและการสื่อสารภายในกรม เป็นหน้าที่ของส่วนใดในสำนักงานเลขานุการกรม?',
        options: [
          { text: 'ฝ่ายการเงิน', isCorrect: false },
          { text: 'กลุ่มงานประชาสัมพันธ์', isCorrect: true },
          { text: 'ฝ่ายพัสดุ', isCorrect: false },
          { text: 'ฝ่ายทรัพยากรบุคคล', isCorrect: false },
        ],
      },
      {
        text: 'ผู้บริหารสูงสุดของสำนักงานเลขานุการกรม มีตำแหน่งเรียกว่าอะไร?',
        options: [
          { text: 'อธิบดี', isCorrect: false },
          { text: 'รองอธิบดี', isCorrect: false },
          { text: 'เลขานุการกรม', isCorrect: true },
          { text: 'ผู้อำนวยการกอง', isCorrect: false },
        ],
      },
      {
        text: 'หากหน่วยงานภายนอกต้องการขอเข้าพบอธิบดีกรมการท่องเที่ยว ควรประสานงานผ่านหน่วยงานใด?',
        options: [
          { text: 'กลุ่มตรวจสอบภายใน', isCorrect: false },
          { text: 'สำนักงานเลขานุการกรม (หน้าห้อง/งานบริหารทั่วไป)', isCorrect: true },
          { text: 'กองกิจการภาพยนตร์ฯ', isCorrect: false },
          { text: 'กองพัฒนาบริการท่องเที่ยว', isCorrect: false },
        ],
      },
    ],
  },
  // Section 10
  {
    sectionIdx: 9,
    questions: [
      {
        text: 'กลุ่มพัฒนาระบบบริหาร (กพร.) มีหน้าที่หลักในการทำสิ่งใด?',
        options: [
          { text: 'ตรวจสอบการทุจริต', isCorrect: false },
          { text: 'พัฒนาและปรับปรุงระบบการทำงานขององค์กรให้มีประสิทธิภาพตามหลักธรรมาภิบาล', isCorrect: true },
          { text: 'อนุมัติงบประมาณประจำปี', isCorrect: false },
          { text: 'พัฒนาแอปพลิเคชันมือถือ', isCorrect: false },
        ],
      },
      {
        text: 'กพร. ของกรม ต้องทำงานสอดคล้องกับนโยบายของหน่วยงานกลางใด?',
        options: [
          { text: 'สำนักงาน ก.พ.ร. (สำนักงานคณะกรรมการพัฒนาระบบราชการ)', isCorrect: true },
          { text: 'สำนักงาน ก.ก.ต.', isCorrect: false },
          { text: 'สำนักงาน ป.ป.ช.', isCorrect: false },
          { text: 'กระทรวงการคลัง', isCorrect: false },
        ],
      },
      {
        text: 'การลดขั้นตอนการปฏิบัติงานเพื่ออำนวยความสะดวกแก่ประชาชน (Ease of Doing Business) เป็นบทบาทของหน่วยงานใด?',
        options: [
          { text: 'กองทะเบียนธุรกิจนำเที่ยว', isCorrect: false },
          { text: 'กลุ่มพัฒนาระบบบริหาร', isCorrect: true },
          { text: 'กลุ่มงานจริยธรรม', isCorrect: false },
          { text: 'กองทุนคุ้มครองธุรกิจนำเที่ยว', isCorrect: false },
        ],
      },
      {
        text: 'เครื่องมือการบริหารใดที่ กพร. มักนำมาใช้ในการประเมินส่วนราชการ?',
        options: [
          { text: 'PMQA (เกณฑ์คุณภาพการบริหารจัดการภาครัฐ)', isCorrect: true },
          { text: 'ISO 9001', isCorrect: false },
          { text: 'GMP', isCorrect: false },
          { text: 'HACCP', isCorrect: false },
        ],
      },
      {
        text: 'ตัวชี้วัดผลการปฏิบัติราชการ (KPIs) ของกรมการท่องเที่ยว จัดทำและติดตามผลโดยหน่วยงานใด?',
        options: [
          { text: 'สำนักงานเลขานุการกรม', isCorrect: false },
          { text: 'กลุ่มพัฒนาระบบบริหาร', isCorrect: true },
          { text: 'กองพัฒนาแหล่งท่องเที่ยว', isCorrect: false },
          { text: 'กองกิจการภาพยนตร์และวีดิทัศน์ต่างประเทศ', isCorrect: false },
        ],
      },
    ],
  },
];

export async function GET() {
  try {
    const results: any[] = [];

    for (const data of QUIZ_DATA) {
      const section = SECTIONS[data.sectionIdx];

      // Find existing Quiz for section
      const existingQuiz = await prisma.quiz.findUnique({
        where: { sectionId: section.id },
        include: { questions: { include: { options: true } } },
      });

      // Safely cleanup old questions & options if quiz exists
      if (existingQuiz) {
        for (const q of existingQuiz.questions) {
          await prisma.option.deleteMany({ where: { questionId: q.id } });
        }
        await prisma.question.deleteMany({ where: { quizId: existingQuiz.id } });

        // Update title and passScore
        await prisma.quiz.update({
          where: { id: existingQuiz.id },
          data: {
            title: section.title,
            passScore: 80,
          },
        });

        // Add 5 new questions
        for (const qData of data.questions) {
          await prisma.question.create({
            data: {
              quizId: existingQuiz.id,
              text: qData.text,
              options: {
                create: qData.options.map((opt) => ({
                  text: opt.text,
                  isCorrect: opt.isCorrect,
                })),
              },
            },
          });
        }

        results.push({
          section: section.title,
          quizId: existingQuiz.id,
          questionsCount: data.questions.length,
          status: 'UPDATED',
        });
      } else {
        // Create new quiz with 5 questions
        const newQuiz = await prisma.quiz.create({
          data: {
            title: section.title,
            passScore: 80,
            sectionId: section.id,
            questions: {
              create: data.questions.map((q) => ({
                text: q.text,
                options: {
                  create: q.options.map((opt) => ({
                    text: opt.text,
                    isCorrect: opt.isCorrect,
                  })),
                },
              })),
            },
          },
        });

        results.push({
          section: section.title,
          quizId: newQuiz.id,
          questionsCount: data.questions.length,
          status: 'CREATED',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully imported 50 quiz questions into 10 sections!',
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    );
  }
}
