import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ============================================================
// CORRECTED QUIZ DATA - Verified against official DOT sources
// dot.go.th, Wikipedia, tfo.dot.go.th
// ============================================================
const QUIZ_UPDATES: Record<string, { questions: { text: string; options: { text: string; isCorrect: boolean }[] }[] }> = {

  // Quiz 1: แนะนำกรมการท่องเที่ยว
  'cmqqfofnu001a269xg444z21v': {
    questions: [
      {
        text: 'กรมการท่องเที่ยวสังกัดอยู่ในกระทรวงใด?',
        options: [
          { text: 'กระทรวงการท่องเที่ยวและกีฬา', isCorrect: true },
          { text: 'กระทรวงวัฒนธรรม', isCorrect: false },
          { text: 'กระทรวงการต่างประเทศ', isCorrect: false },
          { text: 'กระทรวงมหาดไทย', isCorrect: false },
        ],
      },
      {
        text: 'โครงสร้างหน่วยงานของกรมการท่องเที่ยว มีกี่หน่วยงานหลัก?',
        options: [
          { text: '6 หน่วยงาน (สำนักงานเลขานุการกรม + 5 กอง)', isCorrect: true },
          { text: '3 หน่วยงาน', isCorrect: false },
          { text: '10 หน่วยงาน', isCorrect: false },
          { text: '8 หน่วยงาน', isCorrect: false },
        ],
      },
      {
        text: 'ข้อใดคือความหมายของระบบ DEC ของกรมการท่องเที่ยว?',
        options: [
          { text: 'DOT e-Service Center ระบบศูนย์รวมบริการดิจิทัลของกรมการท่องเที่ยว', isCorrect: true },
          { text: 'Digital Economy and Community ระบบของกระทรวงดิจิทัล', isCorrect: false },
          { text: 'Data Exchange Center ระบบแลกเปลี่ยนข้อมูลท่องเที่ยว', isCorrect: false },
          { text: 'Department E-Commerce ระบบพาณิชย์อิเล็กทรอนิกส์', isCorrect: false },
        ],
      },
      {
        text: 'กรมการท่องเที่ยวตั้งอยู่ ณ ที่ใด?',
        options: [
          { text: 'ชั้น 2 อาคารซี ศูนย์ราชการเฉลิมพระเกียรติฯ ถนนแจ้งวัฒนะ กรุงเทพมหานคร', isCorrect: true },
          { text: 'อาคารกระทรวงการท่องเที่ยวฯ ถนนราชดำเนิน', isCorrect: false },
          { text: 'อาคารสาทรซิตี้ ถนนสาทรใต้', isCorrect: false },
          { text: 'สนามบินสุวรรณภูมิ พื้นที่ผู้โดยสารขาออก', isCorrect: false },
        ],
      },
      {
        text: 'ข้อใดไม่ใช่บทบาทหน้าที่โดยตรงของกรมการท่องเที่ยวตามกฎหมาย?',
        options: [
          { text: 'การควบคุมดูแลการตั้งด่านตรวจคนเข้าเมืองและการเก็บค่าธรรมเนียมวีซ่า', isCorrect: true },
          { text: 'การขึ้นทะเบียนและกำกับดูแลการประกอบธุรกิจนำเที่ยว', isCorrect: false },
          { text: 'การพัฒนาและประเมินรับรองมาตรฐานแหล่งท่องเที่ยว', isCorrect: false },
          { text: 'การส่งเสริมภาพยนตร์ต่างประเทศที่เข้ามาถ่ายทำในประเทศไทย', isCorrect: false },
        ],
      },
    ],
  },

  // Quiz 9: เที่ยวไทยสบายใจ ด้วยระบบ DEC (แก้ชื่อย่อให้ถูกต้อง)
  'cmqqfofqj0086269xvcj52x23': {
    questions: [
      {
        text: 'DEC ในบริบทของกรมการท่องเที่ยว ย่อมาจากอะไร?',
        options: [
          { text: 'DOT e-Service Center ศูนย์รวมบริการดิจิทัลของกรมการท่องเที่ยว', isCorrect: true },
          { text: 'Digital Economy and Community ของกระทรวงดิจิทัล', isCorrect: false },
          { text: 'Department Excellence Center แผนกบริการพิเศษ', isCorrect: false },
          { text: 'Dynamic E-Commerce Platform ระบบพาณิชย์ออนไลน์', isCorrect: false },
        ],
      },
      {
        text: 'ระบบ DEC ของกรมการท่องเที่ยวมีเป้าหมายหลักอย่างไร?',
        options: [
          { text: 'เป็น One-stop service รวมทุกบริการของกรมฯ ไว้ในที่เดียว ลดขั้นตอนและความยุ่งยาก', isCorrect: true },
          { text: 'เป็นแพลตฟอร์มจองโรงแรมและตั๋วเครื่องบินราคาถูก', isCorrect: false },
          { text: 'เป็นระบบตรวจสอบความปลอดภัยของนักท่องเที่ยวชาวต่างชาติ', isCorrect: false },
          { text: 'เป็นแอปพลิเคชันแนะนำเส้นทางการเดินทางทั่วประเทศ', isCorrect: false },
        ],
      },
      {
        text: 'ผู้ประกอบการธุรกิจนำเที่ยวสามารถใช้ระบบดิจิทัลของกรมการท่องเที่ยวทำอะไรได้บ้าง?',
        options: [
          { text: 'ยื่นขอใบอนุญาต ต่ออายุ และติดตามสถานะใบอนุญาตผ่านระบบ e-License ออนไลน์', isCorrect: true },
          { text: 'ขายทัวร์ออนไลน์โดยตรงผ่านเว็บไซต์ของกรมการท่องเที่ยว', isCorrect: false },
          { text: 'กู้เงินดอกเบี้ยต่ำเพื่อขยายกิจการท่องเที่ยว', isCorrect: false },
          { text: 'จองห้องพักในโรงแรมที่ร่วมโครงการกับกรมการท่องเที่ยว', isCorrect: false },
        ],
      },
      {
        text: 'ประโยชน์ของระบบ DEC ต่อประชาชนและผู้ประกอบการคืออะไร?',
        options: [
          { text: 'ลดขั้นตอนการติดต่อราชการ ไม่ต้องเดินทางมาสำนักงานหลายครั้ง', isCorrect: true },
          { text: 'ได้รับส่วนลดพิเศษจากทุกบริการภายในกรมการท่องเที่ยว', isCorrect: false },
          { text: 'ทำให้กรมการท่องเที่ยวสามารถปิดสำนักงานสาขาทั้งหมดได้', isCorrect: false },
          { text: 'ช่วยให้ผู้ประกอบการสามารถหลีกเลี่ยงกฎหมายบางข้อได้', isCorrect: false },
        ],
      },
      {
        text: 'การพัฒนาบริการดิจิทัลของกรมการท่องเที่ยวสอดคล้องกับนโยบายใดของรัฐบาล?',
        options: [
          { text: 'นโยบาย Thailand 4.0 ที่มุ่งพัฒนาเศรษฐกิจดิจิทัลและรัฐบาลดิจิทัล', isCorrect: true },
          { text: 'นโยบายลดจำนวนข้าราชการในส่วนราชการ', isCorrect: false },
          { text: 'นโยบายการใช้เงินสดแทนการชำระเงินดิจิทัล', isCorrect: false },
          { text: 'นโยบายการห้ามใช้สมาร์ทโฟนในหน่วยงานราชการ', isCorrect: false },
        ],
      },
    ],
  },

  // Quiz 8: การท่องเที่ยวเชิงสร้างสรรค์
  'cmqqfofq7007b269xkvbw83n1': {
    questions: [
      {
        text: 'การท่องเที่ยวเชิงสร้างสรรค์ (Creative Tourism) มีลักษณะเด่นที่แตกต่างจากการท่องเที่ยวทั่วไปอย่างไร?',
        options: [
          { text: 'เน้นการมีส่วนร่วมและเรียนรู้เชิงลึกร่วมกับเจ้าของพื้นที่ ศิลปะ และวัฒนธรรมท้องถิ่น', isCorrect: true },
          { text: 'เน้นการช้อปปิ้งและการบันเทิงในห้างสรรพสินค้าขนาดใหญ่', isCorrect: false },
          { text: 'เน้นการเดินทางท่องเที่ยวแบบรวดเร็วให้ครบสถานที่มากที่สุด', isCorrect: false },
          { text: 'เน้นความหรูหราและการบริการระดับพรีเมียมเป็นหลัก', isCorrect: false },
        ],
      },
      {
        text: 'ข้อใดเป็นตัวอย่างของกิจกรรมการท่องเที่ยวเชิงสร้างสรรค์ที่ชัดเจนที่สุด?',
        options: [
          { text: 'เรียนทำอาหารไทยพื้นบ้านกับครัวชุมชน หรือทอผ้าไหมกับช่างทอในหมู่บ้านหัตถกรรม', isCorrect: true },
          { text: 'นั่งรถบัสชมเมืองแบบ City Tour ครึ่งวัน', isCorrect: false },
          { text: 'พักโรงแรม 5 ดาวริมทะเลและใช้สปาตลอดวัน', isCorrect: false },
          { text: 'ซื้อแพ็กเกจทัวร์กับบริษัทนำเที่ยวขนาดใหญ่', isCorrect: false },
        ],
      },
      {
        text: 'กรมการท่องเที่ยวส่งเสริมการท่องเที่ยวเชิงสร้างสรรค์เพื่อประโยชน์ใด?',
        options: [
          { text: 'กระจายรายได้สู่ชุมชน อนุรักษ์ภูมิปัญญาท้องถิ่น และดึงดูดนักท่องเที่ยวคุณภาพสูง', isCorrect: true },
          { text: 'ลดปริมาณนักท่องเที่ยวเพื่อลดความแออัดในเมืองหลัก', isCorrect: false },
          { text: 'เพิ่มรายได้ให้บริษัทท่องเที่ยวขนาดใหญ่เท่านั้น', isCorrect: false },
          { text: 'สร้างสวนสนุกและแหล่งบันเทิงในพื้นที่ชนบท', isCorrect: false },
        ],
      },
      {
        text: 'ชุมชนมีบทบาทอย่างไรในการท่องเที่ยวเชิงสร้างสรรค์?',
        options: [
          { text: 'เป็นทั้งเจ้าบ้านและผู้ถ่ายทอดองค์ความรู้ ศิลปะ และวัฒนธรรมให้แก่นักท่องเที่ยวโดยตรง', isCorrect: true },
          { text: 'เป็นเพียงพนักงานรับจ้างทำความสะอาดในรีสอร์ทระดับหรู', isCorrect: false },
          { text: 'ไม่มีบทบาทใดๆ เพราะรัฐบาลเป็นผู้บริหารทั้งหมด', isCorrect: false },
          { text: 'เป็นเพียงผู้ขายสินค้าของฝากในตลาดนัดชุมชนเท่านั้น', isCorrect: false },
        ],
      },
      {
        text: 'ข้อใดเป็นจุดแข็งของการท่องเที่ยวเชิงสร้างสรรค์ที่ส่งผลต่อการพัฒนาที่ยั่งยืน?',
        options: [
          { text: 'สร้างประสบการณ์เฉพาะตัวที่ไม่สามารถลอกเลียนแบบได้ ทำให้ชุมชนมีเอกลักษณ์โดดเด่น', isCorrect: true },
          { text: 'ใช้งบประมาณน้อยกว่าการท่องเที่ยวเชิงนิเวศทุกประเภท', isCorrect: false },
          { text: 'ไม่ต้องพัฒนาโครงสร้างพื้นฐานใดๆ เพิ่มเติม', isCorrect: false },
          { text: 'ดึงดูดนักท่องเที่ยวได้มากกว่าทุกรูปแบบการท่องเที่ยว', isCorrect: false },
        ],
      },
    ],
  },

  // Quiz 13: ต้นแบบที่พักเป็นมิตรกับสิ่งแวดล้อม
  'cmqqfofrx00bm269x6pgbpxiv': {
    questions: [
      {
        text: 'มาตรฐานโฮมสเตย์ไทย กำหนดจำนวนห้องพักสูงสุดต่อหลังไว้อย่างไร?',
        options: [
          { text: 'ไม่เกิน 4 ห้อง และรองรับผู้พักได้ไม่เกิน 20 คน', isCorrect: true },
          { text: 'ไม่เกิน 10 ห้อง และรองรับผู้พักได้ไม่เกิน 50 คน', isCorrect: false },
          { text: 'ไม่จำกัดจำนวน ขึ้นอยู่กับพื้นที่และงบประมาณ', isCorrect: false },
          { text: 'ไม่เกิน 2 ห้อง และรองรับผู้พักได้ไม่เกิน 8 คน', isCorrect: false },
        ],
      },
      {
        text: 'มาตรฐานโฮมสเตย์ไทยมีการประเมินกี่ด้านหลัก?',
        options: [
          { text: '10 ด้าน ครอบคลุมตั้งแต่ที่พัก อาหาร ความปลอดภัย ไปจนถึงวัฒนธรรมและสิ่งแวดล้อม', isCorrect: true },
          { text: '5 ด้าน ได้แก่ ที่พัก อาหาร ความปลอดภัย ราคา และการบริการ', isCorrect: false },
          { text: '3 ด้าน ได้แก่ ที่พัก ความสะอาด และราคา', isCorrect: false },
          { text: '15 ด้าน รวมถึงการประเมินบุคลิกภาพเจ้าของบ้าน', isCorrect: false },
        ],
      },
      {
        text: 'ตราสัญลักษณ์มาตรฐานโฮมสเตย์ไทยมีอายุการรับรองกี่ปี?',
        options: [
          { text: '3 ปี ก่อนต้องผ่านการประเมินรับรองใหม่', isCorrect: true },
          { text: '1 ปี ต้องต่ออายุทุกปี', isCorrect: false },
          { text: '5 ปี และสามารถต่ออายุได้ 1 ครั้ง', isCorrect: false },
          { text: 'ตลอดชีพ ไม่มีวันหมดอายุ', isCorrect: false },
        ],
      },
      {
        text: 'ที่พักเป็นมิตรกับสิ่งแวดล้อม (Green/Eco Accommodation) มีลักษณะสำคัญอย่างไร?',
        options: [
          { text: 'ลดการใช้พลังงาน น้ำ ลดขยะ ใช้วัสดุธรรมชาติ และสนับสนุนสินค้าชุมชนท้องถิ่น', isCorrect: true },
          { text: 'ตั้งอยู่ในป่าลึกโดยไม่มีไฟฟ้าและน้ำประปาเด็ดขาด', isCorrect: false },
          { text: 'มีพืชพรรณประดับตกแต่งภายในห้องพักจำนวนมากเท่านั้น', isCorrect: false },
          { text: 'ห้ามนักท่องเที่ยวพกพาสิ่งของจากภายนอกเข้ามาในที่พัก', isCorrect: false },
        ],
      },
      {
        text: 'กรมการท่องเที่ยวส่งเสริมที่พักเป็นมิตรกับสิ่งแวดล้อมเพราะเหตุใด?',
        options: [
          { text: 'เพื่อรักษาทรัพยากรธรรมชาติ ลดผลกระทบสิ่งแวดล้อม และตอบสนองนักท่องเที่ยวคุณภาพสูง', isCorrect: true },
          { text: 'เพื่อลดต้นทุนการก่อสร้างของผู้ประกอบการให้น้อยที่สุด', isCorrect: false },
          { text: 'เพื่อเพิ่มจำนวนที่พักในแหล่งท่องเที่ยวให้ได้มากที่สุด', isCorrect: false },
          { text: 'เพื่อหารายได้จากการขายใบรับรองมาตรฐานสีเขียว', isCorrect: false },
        ],
      },
    ],
  },

  // Quiz 14: กรมการท่องเที่ยว Department of Tourism
  'cmqqfofsg00ch269x6c4q1396': {
    questions: [
      {
        text: 'กองกิจการภาพยนตร์และวีดิทัศน์ต่างประเทศ (Thailand Film Office) มีหน้าที่หลักอะไร?',
        options: [
          { text: 'ออกใบอนุญาต (Film Permit) และส่งเสริมประเทศไทยให้เป็นจุดหมายของการถ่ายทำภาพยนตร์ต่างประเทศ', isCorrect: true },
          { text: 'สั่งซื้อลิขสิทธิ์ภาพยนตร์ต่างประเทศมาฉายในประเทศไทย', isCorrect: false },
          { text: 'ดูแลโรงภาพยนตร์และห้องสมุดภาพยนตร์ของรัฐบาล', isCorrect: false },
          { text: 'ตรวจพิจารณาเนื้อหาภาพยนตร์ไทยก่อนออกฉาย', isCorrect: false },
        ],
      },
      {
        text: 'ประโยชน์ที่ประเทศไทยได้รับจากการดึงดูดกองถ่ายภาพยนตร์ต่างชาติ ข้อใดถูกต้องที่สุด?',
        options: [
          { text: 'สร้างรายได้เงินตราต่างประเทศ จ้างงานทีมงานไทย และเผยแพร่ภาพลักษณ์ประเทศสู่โลก', isCorrect: true },
          { text: 'ช่วยให้คนไทยได้รับชมภาพยนตร์ฟรีโดยไม่เสียค่าลิขสิทธิ์', isCorrect: false },
          { text: 'ทำให้ไม่จำเป็นต้องพัฒนาอุตสาหกรรมภาพยนตร์ในประเทศ', isCorrect: false },
          { text: 'ลดการส่งออกสินค้าเกษตรเนื่องจากเกษตรกรหันมาเป็นตัวประกอบ', isCorrect: false },
        ],
      },
      {
        text: 'มาตรการ Cash Rebate สูงสุด 30% ของ Thailand Film Office หมายความว่าอะไร?',
        options: [
          { text: 'รัฐบาลไทยคืนเงินสูงสุด 30% ของค่าใช้จ่ายการถ่ายทำในไทยให้แก่กองถ่ายที่เข้าเงื่อนไข', isCorrect: true },
          { text: 'กองถ่ายต่างชาติต้องจ่ายภาษีเพิ่มเติม 30% ของรายได้', isCorrect: false },
          { text: 'ผู้ชมภาพยนตร์ที่ถ่ายทำในไทยได้รับส่วนลดตั๋ว 30%', isCorrect: false },
          { text: 'ค่าธรรมเนียมใบอนุญาตถ่ายทำจะถูกลด 30% สำหรับทุกโปรดักชั่น', isCorrect: false },
        ],
      },
      {
        text: 'เว็บไซต์ทางการของ Thailand Film Office คือข้อใด?',
        options: [
          { text: 'www.tfo.dot.go.th', isCorrect: true },
          { text: 'www.thaifilm.com', isCorrect: false },
          { text: 'www.film.go.th', isCorrect: false },
          { text: 'www.mts.or.th', isCorrect: false },
        ],
      },
      {
        text: 'กองกิจการภาพยนตร์ฯ สังกัดอยู่ในหน่วยงานใด?',
        options: [
          { text: 'กรมการท่องเที่ยว กระทรวงการท่องเที่ยวและกีฬา', isCorrect: true },
          { text: 'กระทรวงวัฒนธรรม', isCorrect: false },
          { text: 'กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม', isCorrect: false },
          { text: 'สำนักนายกรัฐมนตรี', isCorrect: false },
        ],
      },
    ],
  },
};

export async function GET() {
  try {
    let updatedQuizzes = 0;
    let updatedQuestions = 0;

    for (const [quizId, quizData] of Object.entries(QUIZ_UPDATES)) {
      // Get existing questions for this quiz
      const existingQuestions = await prisma.question.findMany({
        where: { quizId },
        include: { options: true },
      });

      // Delete existing options then questions
      for (const q of existingQuestions) {
        await prisma.option.deleteMany({ where: { questionId: q.id } });
      }
      await prisma.question.deleteMany({ where: { quizId } });

      // Create new questions and options
      for (let i = 0; i < quizData.questions.length; i++) {
        const qData = quizData.questions[i];
        const question = await prisma.question.create({
          data: {
            quizId,
            text: qData.text,
            order: i + 1,
          },
        });

        for (const optData of qData.options) {
          await prisma.option.create({
            data: {
              questionId: question.id,
              text: optData.text,
              isCorrect: optData.isCorrect,
            },
          });
        }
        updatedQuestions++;
      }
      updatedQuizzes++;
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedQuizzes} quizzes with ${updatedQuestions} questions successfully`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
