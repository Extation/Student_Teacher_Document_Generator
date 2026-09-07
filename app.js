/* ==========================================================================
   Professional Document Generator - app.js
   Pure client-side logic: State, Rendering, Persistence, Logo Fetch, Export.
   ========================================================================== */

// ==========================================================================
// 1. State Management
// ==========================================================================
const STATE_KEY = 'docgen_pro_state_v3';

const defaultState = {
    globalCurrency: '₱',
    activeModule: 'student-module',

    // ── Student fields (pre-filled with sample data) ──
    studentDocType: 'schedule',
    studentTemplate: 'classic',
    studentFname: 'Juan',
    studentLname: 'Dela Cruz',
    studentSchool: 'Mapúa University',
    studentAddress: '658 Muralla St, Intramuros, Manila, 1002 Metro Manila',
    studentId: 'STU-2025-04821',
    studentDate: '2025-08-20',
    studentSemester: '1st Semester',
    studentAcademicYear: '2025-2026',
    studentLogo: '',
    studentSchedule:
        'Monday - 8:00 AM - Data Structures and Algorithms\n' +
        'Monday - 10:00 AM - Software Engineering\n' +
        'Tuesday - 9:00 AM - Database Management Systems\n' +
        'Wednesday - 1:00 PM - Operating Systems\n' +
        'Thursday - 8:00 AM - Web Development\n' +
        'Friday - 10:00 AM - Physical Education',
    studentUnits: '18.0',
    studentRepName: '',
    studentAutoSig: false,

    // Receipt-specific
    studentAmount: '45000.00',
    studentPaymentMethod: 'Bank Transfer',
    studentReceiptNo: 'REC-2025-00347',

    // Proof of Enrollment-specific
    studentProgram: 'Bachelor of Science in Computer Science',
    studentYearLevel: '3rd Year',

    // ID Card specific
    studentPhoto: '',
    studentValidUntil: '2026-08-23',

    // ── Teacher fields (pre-filled with sample data) ──
    teacherDocType: 'coe',
    teacherTemplate: 'classic',
    teacherCertNo: 'HR-2025-0984',
    teacherSchool: 'Mapúa Senior High School',
    teacherAddress: '658 Muralla St, Intramuros, Manila, 1002 Metro Manila',
    teacherEmail: 'shs.admin@mapua.edu.ph',
    teacherPhone: '+63 2 8247 5000',
    teacherFullname: 'Maria Concepcion Santos',
    teacherPronoun: 'She/Her',
    teacherTitle: 'Senior High School Science Teacher',
    teacherType: 'Full-Time',
    teacherStartdate: '2018-06-15',
    teacherIssuedate: '2025-08-20',
    teacherResponsibilities:
        'Facilitating daily classroom instruction for Senior High School students\n' +
        'Developing K-12 compliant lesson plans and science curriculum\n' +
        'Evaluating student performance and maintaining official grade records\n' +
        'Communicating with parents regarding student progress\n' +
        'Supervising student laboratory sessions and extracurricular activities',
    
    // Payslip-specific
    teacherPayPeriod: 'August 1 - 15, 2025',
    teacherBasicSalary: '25000.00',
    teacherAllowances: '3000.00',
    teacherTax: '1500.00',
    teacherSSS: '1125.00',
    teacherPhilhealth: '625.00',
    teacherPagibig: '200.00',

    // License-specific
    teacherLicenseNo: 'LPT-2018-789012',
    teacherRegDate: '2018-08-15',
    teacherExpDate: '2028-08-15',
    teacherProfTitle: 'Licensed Professional Teacher',

    teacherLogo: '',
    teacherSignature: '',
    teacherRepName: '',
    teacherAutoSig: false,

    // ID Card specific
    teacherIdNumber: '',
    teacherValidUntil: '',
    
    // Custom Branding
    customLogo: '',
    primaryColor: '#0b3d91',
    qrEnabled: false
};

let state = {};

function loadState() {
    try {
        const saved = localStorage.getItem(STATE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            state = { ...defaultState };
            for (const key in parsed) {
                if (parsed[key] !== '') {
                    state[key] = parsed[key];
                }
            }
        } else {
            state = { ...defaultState };
        }
    } catch {
        state = { ...defaultState };
    }
    
    // Apply primary color on load
    document.documentElement.style.setProperty('--primary-color', state.primaryColor);
}

function saveState() {
    try {
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('Could not save state to localStorage:', e);
    }
}

// ==========================================================================
// 2. University Logo Map (local files in school_logos/)
// ==========================================================================
const UNIVERSITY_LOGOS = {
    // ── Philippine Schools (local logos via LOGO_DATA) ──
    UP:        { name: 'University of the Philippines',                   file: 'school_logos/ph/UP_logo.png' },
    Ateneo:    { name: 'Ateneo de Manila University',                     file: 'school_logos/ph/Ateneo_logo.png' },
    DLSU:      { name: 'De La Salle University',                          file: 'school_logos/ph/DLSU_logo.png' },
    UST:       { name: 'University of Santo Tomas',                       file: 'school_logos/ph/UST_logo.png' },
    Adamson:   { name: 'Adamson University',                              file: 'school_logos/ph/Adamson_logo.png' },
    Mapua:     { name: 'Mapúa University',                                file: 'school_logos/ph/Mapua_logo.png' },
    PUP:       { name: 'Polytechnic University of the Philippines',       file: 'school_logos/ph/PUP_logo.png' },
    Silliman:  { name: 'Silliman University',                             file: 'school_logos/ph/Silliman_logo.png' },
    MSU_PH:    { name: 'Mindanao State University',                       file: 'school_logos/ph/MSU_logo.png' },
    PSHS:      { name: 'Philippine Science High School',                  file: 'school_logos/ph/PSHS_logo.png' },
    AteneoSHS: { name: 'Ateneo de Manila Senior High School',             file: 'school_logos/ph/AteneoSHS_logo.png' },
    UPIS:      { name: 'University of the Philippines Integrated School', file: 'school_logos/ph/UPIS_logo.png' },
    ISM:       { name: 'International School Manila',                     file: 'school_logos/ph/ISM_logo.png' },
    MaSci:     { name: 'Manila Science High School',                      file: 'school_logos/ph/MaSci_logo.png' },
    DLSUSHS:   { name: 'De La Salle University Senior High School',       file: 'school_logos/ph/DLSUSHS_logo.png' },
    Xavier:    { name: 'Xavier School',                                   file: 'school_logos/ph/Xavier_logo.png' },
    USTSHS:    { name: 'University of Santo Tomas Senior High School',    file: 'school_logos/ph/UST_logo.png' },
    QueSci:    { name: 'Quezon City Science High School',                 file: 'school_logos/ph/QueSci_logo.png' },
    BSM:       { name: 'British School Manila',                           file: 'school_logos/ph/BSM_logo.png' },
    MapuaMCL:  { name: 'Mapua MCL Senior High School',                    file: 'school_logos/ph/Mapua_logo.png' },

    // ── US Universities (logos downloaded locally) ──
    MIT:       { name: 'Massachusetts Institute of Technology (MIT)',      file: 'school_logos/us/MIT_logo.png' },
    Harvard:   { name: 'Harvard University',                              file: 'school_logos/us/Harvard_logo.png' },
    Stanford:  { name: 'Stanford University',                             file: 'school_logos/us/Stanford_logo.png' },
    Yale:      { name: 'Yale University',                                 file: 'school_logos/us/Yale_logo.png' },
    Princeton: { name: 'Princeton University',                            file: 'school_logos/us/Princeton_logo.png' },
    Caltech:   { name: 'California Institute of Technology (Caltech)',     file: 'school_logos/us/Caltech_logo.png' },
    Columbia:  { name: 'Columbia University',                             file: 'school_logos/us/Columbia_logo.png' },
    JHU:       { name: 'Johns Hopkins University',                        file: 'school_logos/us/JHU_logo.png' },
    UPenn:     { name: 'University of Pennsylvania',                      file: 'school_logos/us/UPenn_logo.png' },
    NWU:       { name: 'Northwestern University',                         file: 'school_logos/us/NWU_logo.png' },
    UCB:       { name: 'University of California, Berkeley',              file: 'school_logos/us/UCB_logo.png' },
    UCLA:      { name: 'University of California, Los Angeles (UCLA)',    file: 'school_logos/us/UCLA_logo.png' },
    UMich:     { name: 'University of Michigan',                          file: 'school_logos/us/UMich_logo.png' },
    UVA:       { name: 'University of Virginia',                          file: 'school_logos/us/UVA_logo.png' },
    GaTech:    { name: 'Georgia Institute of Technology',                 file: 'school_logos/us/GaTech_logo.png' },
    UNC:       { name: 'University of North Carolina, Chapel Hill',       file: 'school_logos/us/UNC_logo.png' },
    UCSD:      { name: 'University of California, San Diego',             file: 'school_logos/us/UCSD_logo.png' },
    UIUC:      { name: 'University of Illinois Urbana-Champaign',         file: 'school_logos/us/UIUC_logo.png' },
    UWMad:     { name: 'University of Wisconsin-Madison',                 file: 'school_logos/us/UWMad_logo.png' },
    UTAustin:  { name: 'University of Texas at Austin',                   file: 'school_logos/us/UTAustin_logo.png' },
    Cornell:   { name: 'Cornell University',                              file: 'school_logos/us/Cornell_logo.png' },
    USC:       { name: 'University of Southern California (USC)',          file: 'school_logos/us/USC_logo.png' },
    CMU:       { name: 'Carnegie Mellon University',                      file: 'school_logos/us/CMU_logo.png' },
    UWash:     { name: 'University of Washington',                        file: 'school_logos/us/UWash_logo.png' },
    NYU:       { name: 'New York University (NYU)',                       file: 'school_logos/us/NYU_logo.png' },
    UFL:       { name: 'University of Florida',                           file: 'school_logos/us/UFL_logo.png' },
    BU:        { name: 'Boston University',                               file: 'school_logos/us/BU_logo.png' },
    UCSB:      { name: 'University of California, Santa Barbara',         file: 'school_logos/us/UCSB_logo.png' },
    UCD:       { name: 'University of California, Davis',                 file: 'school_logos/us/UCD_logo.png' },
    UCI:       { name: 'University of California, Irvine',                file: 'school_logos/us/UCI_logo.png' },
    UMN:       { name: 'University of Minnesota, Twin Cities',            file: 'school_logos/us/UMN_logo.png' },
    UPitt:     { name: 'University of Pittsburgh',                        file: 'school_logos/us/UPitt_logo.png' },
    OSU:       { name: 'Ohio State University',                           file: 'school_logos/us/OSU_logo.png' },
    UMD:       { name: 'University of Maryland, College Park',            file: 'school_logos/us/UMD_logo.png' },
    Purdue:    { name: 'Purdue University',                               file: 'school_logos/us/Purdue_logo.png' },
    URoch:     { name: 'University of Rochester',                         file: 'school_logos/us/URoch_logo.png' },
    UMiami:    { name: 'University of Miami',                             file: 'school_logos/us/UMiami_logo.png' },
    CUBoulder: { name: 'University of Colorado Boulder',                  file: 'school_logos/us/CUBoulder_logo.png' },
    UAZ:       { name: 'University of Arizona',                           file: 'school_logos/us/UAZ_logo.png' },
    NotreDame: { name: 'University of Notre Dame',                        file: 'school_logos/us/NotreDame_logo.png' },
    UConn:     { name: 'University of Connecticut',                       file: 'school_logos/us/UConn_logo.png' },
    UGA:       { name: 'University of Georgia',                           file: 'school_logos/us/UGA_logo.png' },
    UIC:       { name: 'University of Illinois Chicago',                  file: 'school_logos/us/UIC_logo.png' },
    TAMU:      { name: 'Texas A&M University',                            file: 'school_logos/us/TAMU_logo.png' },
    UMass:     { name: 'University of Massachusetts Amherst',             file: 'school_logos/us/UMass_logo.png' },
    IUB:       { name: 'Indiana University Bloomington',                  file: 'school_logos/us/IUB_logo.png' },
    UCSC:      { name: 'University of California, Santa Cruz',            file: 'school_logos/us/UCSC_logo.png' },
    UDel:      { name: 'University of Delaware',                          file: 'school_logos/us/UDel_logo.png' },
    UOregon:   { name: 'University of Oregon',                            file: 'school_logos/us/UOregon_logo.png' },
    MSU_US:    { name: 'Michigan State University',                       file: 'school_logos/us/MSU_US_logo.png' },
};

// In-memory cache so we only convert once per session
const logoCache = {};

// ==========================================================================
// 3. Logo Loading (Auto-sync with School Name)
// ==========================================================================

window.toggleCustomSchool = function(selectEl, inputId) {
    const inputEl = document.getElementById(inputId);
    if (!inputEl) return;
    let newValue = '';
    if (selectEl.value === 'Other') {
        inputEl.style.display = 'block';
        newValue = ''; // Clear for manual typing
    } else {
        inputEl.style.display = 'none';
        newValue = selectEl.value;
    }
    inputEl.value = newValue;
    
    // Update state immediately
    const stateKey = inputEl.name;
    if (stateKey) {
        state[stateKey] = newValue;
        saveState();
    }

    // Directly trigger logo sync — don't rely on event chain which can fail
    if (newValue) {
        if (inputId === 'student-school') {
            handleSchoolNameLogoSync('studentLogo', newValue);
        } else if (inputId === 'teacher-school') {
            handleSchoolNameLogoSync('teacherLogo', newValue);
        }
    }

    renderPreview();
}


// ==========================================================================
// School Contact Data (address, email, phone per school)
// ==========================================================================
const SCHOOL_CONTACT_DATA = {
    'University of the Philippines': {
        address: 'Diliman, Quezon City, 1101 Metro Manila',
        email: 'ovca@up.edu.ph',
        phone: '+63 2 8981 8500',
        principal: 'Dr. Angelo A. Jimenez',       // UP President
        registrar: 'Prof. Ma. Lurdes C. Tan'      // University Registrar
    },
    'Ateneo de Manila University': {
        address: 'Katipunan Ave, Loyola Heights, Quezon City, 1108 Metro Manila',
        email: 'registrar@ateneo.edu',
        phone: '+63 2 8426 6001',
        principal: 'Fr. Roberto C. Yap, SJ',      // University President
        registrar: 'Ms. Ma. Mercedes G. Planta'    // University Registrar
    },
    'De La Salle University': {
        address: '2401 Taft Avenue, Malate, Manila, 1004 Metro Manila',
        email: 'registrar@dlsu.edu.ph',
        phone: '+63 2 8524 4611',
        principal: 'Br. Bernard S. Oca, FSC',      // University President
        registrar: 'Dr. Myrna P. Quinto'           // University Registrar
    },
    'University of Santo Tomas': {
        address: 'España Blvd, Sampaloc, Manila, 1008 Metro Manila',
        email: 'registrar@ust.edu.ph',
        phone: '+63 2 8786 1611',
        principal: 'Rev. Fr. Richard G. Ang, O.P.',// Rector Magnificus
        registrar: 'Ms. Aimee Rose A. Dela Cruz'   // University Registrar
    },
    'Far Eastern University': {
        address: 'Nicanor Reyes St, Sampaloc, Manila, 1008 Metro Manila',
        email: 'info@feu.edu.ph',
        phone: '+63 2 8735 6212',
        principal: 'Dr. Michael M. Alba',          // University President
        registrar: 'Ms. Cristina R. Santos'        // University Registrar
    },
    'Adamson University': {
        address: '900 San Marcelino St, Ermita, Manila, 1000 Metro Manila',
        email: 'registrar@adamson.edu.ph',
        phone: '+63 2 8524 2011',
        principal: 'Fr. Marcelo V. Manimtim, CM',  // University President
        registrar: 'Ms. Imelda S. Pagtalunan'      // University Registrar
    },
    'Mapúa University': {
        address: '658 Muralla St, Intramuros, Manila, 1002 Metro Manila',
        email: 'admissions@mapua.edu.ph',
        phone: '+63 2 8247 5000',
        principal: 'Dr. Dodjie S. Maestrecampo',   // University President
        registrar: 'Ms. Gina C. Buenaventura'      // University Registrar
    },
    'Mapua MCL Senior High School': {
        address: 'South Pointe Subdivision, Pulo-Diezmo Road, Cabuyao, Laguna 4025',
        email: 'shs.admin@mapua.edu.ph',
        phone: '+63 49 531 5555',
        principal: 'Dr. Dodjie S. Maestrecampo',   // School President
        registrar: 'Ms. Gina C. Buenaventura'      // Registrar
    },
    'Polytechnic University of the Philippines': {
        address: 'Anonas St, Sta. Mesa, Manila, 1016 Metro Manila',
        email: 'registrar@pup.edu.ph',
        phone: '+63 2 5335 1787',
        principal: 'Dr. Manuel M. Muhi',            // University President
        registrar: 'Prof. Zenaida G. Manaog'       // University Registrar
    },
    'Silliman University': {
        address: '6200 Hibbard Avenue, Dumaguete City, Negros Oriental',
        email: 'info@su.edu.ph',
        phone: '+63 35 422 6002',
        principal: 'Dr. Betty Cernol-McCann',       // University President
        registrar: 'Prof. Emervencia L. Ligutom'   // University Registrar
    },
    'Mindanao State University': {
        address: 'MSU Campus, Marawi City, 9700 Lanao del Sur',
        email: 'registrar@msu.edu.ph',
        phone: '+63 63 352 2359',
        principal: 'Dr. Basari D. Mapupuno',        // University President
        registrar: 'Prof. Norhata M. Pendatun'     // University Registrar
    },
    'Philippine Science High School': {
        address: 'Agham Road, Diliman, Quezon City, 1104 Metro Manila',
        email: 'director@pshs.edu.ph',
        phone: '+63 2 8929 7363',
        principal: 'Dr. Lilia T. Habacon',          // Executive Director
        registrar: 'Ms. Maria Elena V. Josa'       // School Registrar
    },
    'Ateneo de Manila Senior High School': {
        address: 'Katipunan Ave, Loyola Heights, Quezon City, 1108 Metro Manila',
        email: 'shs@ateneo.edu',
        phone: '+63 2 8426 6001',
        principal: 'Dr. Maria Luz C. Vilches',      // SHS Principal
        registrar: 'Ms. Ma. Mercedes G. Planta'    // Registrar
    },
    'University of the Philippines Integrated School': {
        address: 'E. Jacinto Street, UP Campus, Diliman, Quezon City, 1101 Metro Manila',
        email: 'upis@up.edu.ph',
        phone: '+63 2 8981 8500',
        principal: 'Dr. Amelia C. Fajardo',         // UPIS Director
        registrar: 'Ms. Rowena B. Abastillas'      // School Registrar
    },
    'International School Manila': {
        address: 'University Parkway, Fort Bonifacio, Taguig City, 1634 Metro Manila',
        email: 'admissions@ismanila.org',
        phone: '+63 2 8840 8400',
        principal: 'Mr. David Toze',                // Head of School
        registrar: 'Ms. Catherine R. Cruz'          // School Registrar
    },
    'Manila Science High School': {
        address: 'Taft Avenue cor. P. Faura St, Ermita, Manila, 1000 Metro Manila',
        email: 'masci.manila@deped.gov.ph',
        phone: '+63 2 8525 9032',
        principal: 'Dr. Leticia F. Pasuquin',       // School Principal
        registrar: 'Ms. Rowena L. Guerrero'         // School Registrar
    },
    'De La Salle University Senior High School': {
        address: '2401 Taft Avenue, Malate, Manila, 1004 Metro Manila',
        email: 'shs.registrar@dlsu.edu.ph',
        phone: '+63 2 8524 4611',
        principal: 'Br. Bernard S. Oca, FSC',       // School President
        registrar: 'Dr. Myrna P. Quinto'            // Registrar
    },
    'Xavier School': {
        address: '64 Xavier Street, Greenhills, San Juan City, 1502 Metro Manila',
        email: 'xsinfo@xavier.edu.ph',
        phone: '+63 2 8721 0843',
        principal: 'Fr. Johnny C. Go, SJ',          // School President
        registrar: 'Ms. Theresa Marie C. Juan'     // School Registrar
    },
    'University of Santo Tomas Senior High School': {
        address: 'España Blvd, Sampaloc, Manila, 1008 Metro Manila',
        email: 'shs@ust.edu.ph',
        phone: '+63 2 8786 1611',
        principal: 'Rev. Fr. Richard G. Ang, O.P.', // Rector Magnificus
        registrar: 'Ms. Aimee Rose A. Dela Cruz'    // Registrar
    },
    'Quezon City Science High School': {
        address: 'Golden Acres Road, Bago Bantay, Quezon City, 1105 Metro Manila',
        email: 'qcshs@deped.gov.ph',
        phone: '+63 2 8373 7395',
        principal: 'Dr. Nelia V. Benito',            // School Principal
        registrar: 'Ms. Gloria M. Santos'            // School Registrar
    },
    'British School Manila': {
        address: '36th Street, University Parkway, Bonifacio Global City, Taguig City, 1634 Metro Manila',
        email: 'enquiries@britishschoolmanila.org',
        phone: '+63 2 8860 1000',
        principal: 'Mr. Simon Mann',
        registrar: 'Ms. Patricia A. Reyes'
    },

    // ── US Universities ──
    'Massachusetts Institute of Technology (MIT)': {
        address: '77 Massachusetts Avenue, Cambridge, MA 02139, USA',
        email: 'admissions@mit.edu',
        phone: '+1 617-253-1000',
        principal: 'Dr. Sally Kornbluth',
        registrar: 'Office of the Registrar'
    },
    'Harvard University': {
        address: 'Massachusetts Hall, Cambridge, MA 02138, USA',
        email: 'admissions@fas.harvard.edu',
        phone: '+1 617-495-1000',
        principal: 'Dr. Alan M. Garber',
        registrar: 'Office of the University Registrar'
    },
    'Stanford University': {
        address: '450 Serra Mall, Stanford, CA 94305, USA',
        email: 'admission@stanford.edu',
        phone: '+1 650-723-2300',
        principal: 'Dr. Jonathan Levin',
        registrar: 'Office of the University Registrar'
    },
    'Yale University': {
        address: 'New Haven, CT 06520, USA',
        email: 'admissions@yale.edu',
        phone: '+1 203-432-4771',
        principal: 'Dr. Peter Salovey',
        registrar: 'Office of the University Registrar'
    },
    'Princeton University': {
        address: '1 Nassau Hall, Princeton, NJ 08544, USA',
        email: 'admission@princeton.edu',
        phone: '+1 609-258-3000',
        principal: 'Dr. Christopher L. Eisgruber',
        registrar: 'Office of the Registrar'
    },
    'California Institute of Technology (Caltech)': {
        address: '1200 East California Boulevard, Pasadena, CA 91125, USA',
        email: 'admissions@caltech.edu',
        phone: '+1 626-395-6811',
        principal: 'Dr. Thomas F. Rosenbaum',
        registrar: 'Office of the Registrar'
    },
    'Columbia University': {
        address: '535 West 116th Street, New York, NY 10027, USA',
        email: 'ugrad-admissions@columbia.edu',
        phone: '+1 212-854-1754',
        principal: 'Dr. Minouche Shafik',
        registrar: 'Office of the University Registrar'
    },
    'Johns Hopkins University': {
        address: '3400 North Charles Street, Baltimore, MD 21218, USA',
        email: 'gotojhu@jhu.edu',
        phone: '+1 410-516-8000',
        principal: 'Dr. Ronald J. Daniels',
        registrar: 'Office of the Registrar'
    },
    'University of Pennsylvania': {
        address: '3451 Walnut Street, Philadelphia, PA 19104, USA',
        email: 'info@admissions.upenn.edu',
        phone: '+1 215-898-5000',
        principal: 'Dr. M. Elizabeth Magill',
        registrar: 'Office of the University Registrar'
    },
    'Northwestern University': {
        address: '633 Clark Street, Evanston, IL 60208, USA',
        email: 'ug-admission@northwestern.edu',
        phone: '+1 847-491-3741',
        principal: 'Dr. Michael Schill',
        registrar: 'Office of the Registrar'
    },
    'University of California, Berkeley': {
        address: '110 Sproul Hall, Berkeley, CA 94720, USA',
        email: 'admissions@berkeley.edu',
        phone: '+1 510-642-6000',
        principal: 'Dr. Carol T. Christ',
        registrar: 'Office of the Registrar'
    },
    'University of California, Los Angeles (UCLA)': {
        address: '405 Hilgard Avenue, Los Angeles, CA 90095, USA',
        email: 'ugadm@saonet.ucla.edu',
        phone: '+1 310-825-4321',
        principal: 'Dr. Gene D. Block',
        registrar: 'Office of the Registrar'
    },
    'University of Michigan': {
        address: '500 South State Street, Ann Arbor, MI 48109, USA',
        email: 'admissions@umich.edu',
        phone: '+1 734-764-1817',
        principal: 'Dr. Santa J. Ono',
        registrar: 'Office of the Registrar'
    },
    'University of Virginia': {
        address: '190 McCormick Road, Charlottesville, VA 22904, USA',
        email: 'undergradadmission@virginia.edu',
        phone: '+1 434-924-0311',
        principal: 'James E. Ryan',
        registrar: 'Office of the University Registrar'
    },
    'Georgia Institute of Technology': {
        address: '225 North Avenue NW, Atlanta, GA 30332, USA',
        email: 'admission@gatech.edu',
        phone: '+1 404-894-2000',
        principal: 'Dr. Ángel Cabrera',
        registrar: 'Office of the Registrar'
    },
    'University of North Carolina, Chapel Hill': {
        address: '103 South Building, Chapel Hill, NC 27599, USA',
        email: 'unchelp@admissions.unc.edu',
        phone: '+1 919-962-2211',
        principal: 'Dr. Kevin M. Guskiewicz',
        registrar: 'Office of the University Registrar'
    },
    'University of California, San Diego': {
        address: '9500 Gilman Drive, La Jolla, CA 92093, USA',
        email: 'admissionsinfo@ucsd.edu',
        phone: '+1 858-534-2230',
        principal: 'Dr. Pradeep K. Khosla',
        registrar: 'Office of the Registrar'
    },
    'University of Illinois Urbana-Champaign': {
        address: '601 East John Street, Champaign, IL 61820, USA',
        email: 'admissions@illinois.edu',
        phone: '+1 217-333-1000',
        principal: 'Dr. Robert J. Jones',
        registrar: 'Office of the Registrar'
    },
    'University of Wisconsin-Madison': {
        address: '500 Lincoln Drive, Madison, WI 53706, USA',
        email: 'onwisconsin@admissions.wisc.edu',
        phone: '+1 608-263-2400',
        principal: 'Dr. Jennifer L. Mnookin',
        registrar: 'Office of the Registrar'
    },
    'University of Texas at Austin': {
        address: '110 Inner Campus Drive, Austin, TX 78712, USA',
        email: 'admissions@utexas.edu',
        phone: '+1 512-471-3434',
        principal: 'Dr. Jay Hartzell',
        registrar: 'Office of the Registrar'
    },
    'Cornell University': {
        address: '410 Thurston Avenue, Ithaca, NY 14850, USA',
        email: 'admissions@cornell.edu',
        phone: '+1 607-255-2000',
        principal: 'Dr. Martha E. Pollack',
        registrar: 'Office of the University Registrar'
    },
    'University of Southern California (USC)': {
        address: '3551 Trousdale Parkway, Los Angeles, CA 90089, USA',
        email: 'admitusc@usc.edu',
        phone: '+1 213-740-2311',
        principal: 'Dr. Carol L. Folt',
        registrar: 'Office of the Registrar'
    },
    'Carnegie Mellon University': {
        address: '5000 Forbes Avenue, Pittsburgh, PA 15213, USA',
        email: 'admission@andrew.cmu.edu',
        phone: '+1 412-268-2000',
        principal: 'Dr. Farnam Jahanian',
        registrar: 'Office of the Registrar'
    },
    'University of Washington': {
        address: '1410 NE Campus Parkway, Seattle, WA 98195, USA',
        email: 'admit@uw.edu',
        phone: '+1 206-543-2100',
        principal: 'Dr. Ana Mari Cauce',
        registrar: 'Office of the University Registrar'
    },
    'New York University (NYU)': {
        address: '70 Washington Square South, New York, NY 10012, USA',
        email: 'admissions@nyu.edu',
        phone: '+1 212-998-1212',
        principal: 'Dr. Linda G. Mills',
        registrar: 'Office of the University Registrar'
    },
    'University of Florida': {
        address: '201 Criser Hall, Gainesville, FL 32611, USA',
        email: 'admissions@ufl.edu',
        phone: '+1 352-392-3261',
        principal: 'Dr. Ben Sasse',
        registrar: 'Office of the University Registrar'
    },
    'Boston University': {
        address: '233 Bay State Road, Boston, MA 02215, USA',
        email: 'admissions@bu.edu',
        phone: '+1 617-353-2300',
        principal: 'Dr. Robert A. Brown',
        registrar: 'Office of the University Registrar'
    },
    'University of California, Santa Barbara': {
        address: '552 University Road, Santa Barbara, CA 93106, USA',
        email: 'admissions@sa.ucsb.edu',
        phone: '+1 805-893-8000',
        principal: 'Dr. Henry T. Yang',
        registrar: 'Office of the Registrar'
    },
    'University of California, Davis': {
        address: '1 Shields Avenue, Davis, CA 95616, USA',
        email: 'admissions@ucdavis.edu',
        phone: '+1 530-752-1011',
        principal: 'Dr. Gary S. May',
        registrar: 'Office of the University Registrar'
    },
    'University of California, Irvine': {
        address: '260 Aldrich Hall, Irvine, CA 92697, USA',
        email: 'admissions@uci.edu',
        phone: '+1 949-824-5011',
        principal: 'Dr. Howard Gillman',
        registrar: 'Office of the Registrar'
    },
    'University of Minnesota, Twin Cities': {
        address: '100 Church Street SE, Minneapolis, MN 55455, USA',
        email: 'admissions@umn.edu',
        phone: '+1 612-625-5000',
        principal: 'Dr. Joan Gabel',
        registrar: 'Office of the Registrar'
    },
    'University of Pittsburgh': {
        address: '4200 Fifth Avenue, Pittsburgh, PA 15260, USA',
        email: 'oafa@pitt.edu',
        phone: '+1 412-624-4141',
        principal: 'Dr. Joan Gabel',
        registrar: 'Office of the University Registrar'
    },
    'Ohio State University': {
        address: '281 West Lane Avenue, Columbus, OH 43210, USA',
        email: 'askabuckeye@osu.edu',
        phone: '+1 614-292-6446',
        principal: 'Dr. Walter E. Carter Jr.',
        registrar: 'Office of the University Registrar'
    },
    'University of Maryland, College Park': {
        address: '7999 Regents Drive, College Park, MD 20742, USA',
        email: 'ApplyMaryland@umd.edu',
        phone: '+1 301-405-1000',
        principal: 'Dr. Darryll J. Pines',
        registrar: 'Office of the Registrar'
    },
    'Purdue University': {
        address: '610 Purdue Mall, West Lafayette, IN 47907, USA',
        email: 'admissions@purdue.edu',
        phone: '+1 765-494-4600',
        principal: 'Dr. Mung Chiang',
        registrar: 'Office of the Registrar'
    },
    'University of Rochester': {
        address: '500 Joseph C. Wilson Boulevard, Rochester, NY 14627, USA',
        email: 'admit@admissions.rochester.edu',
        phone: '+1 585-275-2121',
        principal: 'Dr. Sarah C. Mangelsdorf',
        registrar: 'Office of the University Registrar'
    },
    'University of Miami': {
        address: '1320 South Dixie Highway, Coral Gables, FL 33146, USA',
        email: 'admission@miami.edu',
        phone: '+1 305-284-2211',
        principal: 'Dr. Julio Frenk',
        registrar: 'Office of the University Registrar'
    },
    'University of Colorado Boulder': {
        address: '3100 Marine Street, Boulder, CO 80309, USA',
        email: 'apply@colorado.edu',
        phone: '+1 303-492-1411',
        principal: 'Dr. Todd Saliman',
        registrar: 'Office of the Registrar'
    },
    'University of Arizona': {
        address: '1200 East University Boulevard, Tucson, AZ 85721, USA',
        email: 'admissions@arizona.edu',
        phone: '+1 520-621-2211',
        principal: 'Dr. Robert C. Robbins',
        registrar: 'Office of the Registrar'
    },
    'University of Notre Dame': {
        address: '220 Main Building, Notre Dame, IN 46556, USA',
        email: 'admissions@nd.edu',
        phone: '+1 574-631-5000',
        principal: 'Rev. John I. Jenkins, C.S.C.',
        registrar: 'Office of the Registrar'
    },
    'University of Connecticut': {
        address: '2131 Hillside Road, Storrs, CT 06269, USA',
        email: 'beahusky@uconn.edu',
        phone: '+1 860-486-2000',
        principal: 'Dr. Radenka Maric',
        registrar: 'Office of the Registrar'
    },
    'University of Georgia': {
        address: '210 South Jackson Street, Athens, GA 30602, USA',
        email: 'adm-info@uga.edu',
        phone: '+1 706-542-3000',
        principal: 'Dr. Jere W. Morehead',
        registrar: 'Office of the Registrar'
    },
    'University of Illinois Chicago': {
        address: '1200 West Harrison Street, Chicago, IL 60607, USA',
        email: 'uic-admissions@uic.edu',
        phone: '+1 312-996-7000',
        principal: 'Dr. Timothy L. Killeen',
        registrar: 'Office of the Registrar'
    },
    'Texas A&M University': {
        address: '400 Bizzell Street, College Station, TX 77843, USA',
        email: 'admissions@tamu.edu',
        phone: '+1 979-845-3211',
        principal: 'Gen. Mark A. Welsh III',
        registrar: 'Office of the Registrar'
    },
    'University of Massachusetts Amherst': {
        address: '181 Presidents Drive, Amherst, MA 01003, USA',
        email: 'mail@admissions.umass.edu',
        phone: '+1 413-545-0111',
        principal: 'Dr. Javier Reyes',
        registrar: 'Office of the Registrar'
    },
    'Indiana University Bloomington': {
        address: '107 South Indiana Avenue, Bloomington, IN 47405, USA',
        email: 'iuadmit@indiana.edu',
        phone: '+1 812-855-4848',
        principal: 'Dr. Pamela Whitten',
        registrar: 'Office of the Registrar'
    },
    'University of California, Santa Cruz': {
        address: '1156 High Street, Santa Cruz, CA 95064, USA',
        email: 'admissions@ucsc.edu',
        phone: '+1 831-459-0111',
        principal: 'Dr. Cynthia K. Larive',
        registrar: 'Office of the Registrar'
    },
    'University of Delaware': {
        address: '210 South College Avenue, Newark, DE 19716, USA',
        email: 'admissions@udel.edu',
        phone: '+1 302-831-2000',
        principal: 'Dr. Dennis Assanis',
        registrar: 'Office of the University Registrar'
    },
    'University of Oregon': {
        address: '1585 East 13th Avenue, Eugene, OR 97403, USA',
        email: 'uoadmit@uoregon.edu',
        phone: '+1 541-346-1000',
        principal: 'Dr. Karl Scholz',
        registrar: 'Office of the Registrar'
    },
    'Michigan State University': {
        address: '426 Auditorium Road, East Lansing, MI 48824, USA',
        email: 'admis@msu.edu',
        phone: '+1 517-355-1855',
        principal: 'Dr. Kevin M. Guskiewicz',
        registrar: 'Office of the Registrar'
    }
};

// Legacy alias for backward compatibility
const UNIVERSITY_ADDRESSES = {};
for (const [name, data] of Object.entries(SCHOOL_CONTACT_DATA)) {
    UNIVERSITY_ADDRESSES[name] = data.address;
}

// ==========================================================================
// Random Schedule & Responsibilities Data
// ==========================================================================
const UNIVERSITY_SUBJECTS = [
    'Data Structures and Algorithms', 'Software Engineering', 'Database Management Systems',
    'Operating Systems', 'Web Development', 'Computer Networks', 'Discrete Mathematics',
    'Calculus III', 'Linear Algebra', 'Physics II', 'Technical Writing',
    'Professional Ethics', 'Human-Computer Interaction', 'Mobile App Development',
    'Artificial Intelligence', 'Object-Oriented Programming', 'Statistics and Probability',
    'General Chemistry', 'Microeconomics', 'Filipino II', 'Physical Education',
    'Art Appreciation', 'Purposive Communication', 'Understanding the Self',
    'Science, Technology & Society', 'Rizal\'s Life and Works', 'Information Assurance',
    'Systems Analysis and Design', 'Research Methods', 'Embedded Systems'
];

const SHS_SUBJECTS = [
    'General Mathematics', 'Earth and Life Science', 'Oral Communication',
    'Komunikasyon at Pananaliksik', 'Introduction to Philosophy', 'Physical Education and Health',
    'General Biology 1', 'General Physics 1', 'General Chemistry 1', 'Pre-Calculus',
    'Basic Calculus', 'Statistics and Probability', 'Practical Research 1', 'Practical Research 2',
    'Empowerment Technologies', 'Media and Information Literacy', 'English for Academic & Professional Purposes',
    'Reading and Writing Skills', '21st Century Literature', 'Contemporary Philippine Arts',
    'Personal Development', 'Understanding Culture, Society, and Politics', 'Physical Science',
    'Disaster Readiness and Risk Reduction', 'Creative Writing', 'Creative Nonfiction',
    'General Biology 2', 'General Chemistry 2', 'General Physics 2',
    'Accountancy, Business and Management (ABM)', 'Business Mathematics', 'Fundamentals of ABM'
];

const SCHEDULE_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const SCHEDULE_TIMES = [
    '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'
];

const TEACHER_RESPONSIBILITY_POOL = [
    'Facilitating daily classroom instruction and interactive learning sessions',
    'Developing K-12 compliant lesson plans and subject-specific curriculum',
    'Evaluating student academic performance through formative and summative assessments',
    'Maintaining accurate and up-to-date official grade records',
    'Preparing instructional materials, worksheets, and multimedia presentations',
    'Conducting parent-teacher conferences and reporting student progress',
    'Supervising student laboratory sessions and ensuring safety protocols',
    'Mentoring students in extracurricular activities and academic competitions',
    'Collaborating with fellow faculty on curriculum development and review',
    'Participating in professional development seminars and in-service training',
    'Implementing inclusive and differentiated teaching strategies',
    'Advising and guiding students on academic and career pathways',
    'Coordinating with school administration on academic policy compliance',
    'Organizing and leading field trips, study tours, and educational outreach',
    'Managing classroom discipline and promoting a positive learning environment',
    'Integrating technology and digital tools into instructional delivery',
    'Conducting remedial and enrichment sessions for students',
    'Contributing to accreditation documentation and institutional quality assurance',
    'Serving as class adviser and overseeing homeroom activities',
    'Proctoring examinations and maintaining academic integrity standards',
    'Developing and administering periodic and quarterly assessments',
    'Documenting daily attendance and generating student behavior reports',
    'Leading subject area meetings and department planning sessions',
    'Designing project-based and experiential learning activities',
    'Supporting school-wide events, programs, and ceremonies'
];

// Helper: detect if school is SHS/secondary
function isSecondarySchool(schoolName) {
    if (!schoolName) return false;
    const lower = schoolName.toLowerCase();
    return lower.includes('senior high') || lower.includes('high school') ||
           lower.includes('integrated school') || lower.includes('xavier school') ||
           lower.includes('british school') || lower.includes('international school') ||
           lower.includes('mcl');
}

// Generate a random schedule
function generateRandomSchedule(schoolName) {
    const isSHS = isSecondarySchool(schoolName);
    const subjectPool = isSHS ? [...SHS_SUBJECTS] : [...UNIVERSITY_SUBJECTS];
    const numEntries = 5 + Math.floor(Math.random() * 3); // 5-7 entries
    const lines = [];
    const usedSubjects = new Set();
    const usedSlots = new Set();

    for (let i = 0; i < numEntries && subjectPool.length > 0; i++) {
        // Pick a unique day-time slot
        let day, time, slotKey;
        let attempts = 0;
        do {
            day = SCHEDULE_DAYS[Math.floor(Math.random() * SCHEDULE_DAYS.length)];
            time = SCHEDULE_TIMES[Math.floor(Math.random() * SCHEDULE_TIMES.length)];
            slotKey = `${day}-${time}`;
            attempts++;
        } while (usedSlots.has(slotKey) && attempts < 50);
        usedSlots.add(slotKey);

        // Pick a unique subject
        let subjectIdx;
        let subject;
        let subjectAttempts = 0;
        do {
            subjectIdx = Math.floor(Math.random() * subjectPool.length);
            subject = subjectPool[subjectIdx];
            subjectAttempts++;
        } while (usedSubjects.has(subject) && subjectAttempts < 50);
        usedSubjects.add(subject);

        lines.push(`${day} - ${time} - ${subject}`);
    }

    // Sort by day order then time
    const dayOrder = { Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4 };
    lines.sort((a, b) => {
        const [dayA] = a.split(' - ');
        const [dayB] = b.split(' - ');
        return (dayOrder[dayA] || 0) - (dayOrder[dayB] || 0);
    });

    return lines.join('\n');
}

// Generate random teacher responsibilities
function generateRandomResponsibilities() {
    const pool = [...TEACHER_RESPONSIBILITY_POOL];
    const count = 4 + Math.floor(Math.random() * 3); // 4-6 items
    const selected = [];
    for (let i = 0; i < count && pool.length > 0; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        selected.push(pool.splice(idx, 1)[0]);
    }
    return selected.join('\n');
}

// Global handlers for randomize buttons
window.randomizeSchedule = function() {
    state.studentSchedule = generateRandomSchedule(state.studentSchool);
    saveState();
    const textarea = document.getElementById('student-schedule');
    if (textarea) textarea.value = state.studentSchedule;
    renderPreview();
};

window.randomizeResponsibilities = function() {
    state.teacherResponsibilities = generateRandomResponsibilities();
    saveState();
    const textarea = document.getElementById('teacher-responsibilities');
    if (textarea) textarea.value = state.teacherResponsibilities;
    renderPreview();
};

// Helper: find matching school data from SCHOOL_CONTACT_DATA
function findSchoolData(value) {
    if (!value) return null;
    const valLower = value.toLowerCase();
    
    for (const [schoolName, data] of Object.entries(SCHOOL_CONTACT_DATA)) {
        if (schoolName.toLowerCase() === valLower || valLower.includes(schoolName.toLowerCase())) {
            return data;
        }
    }
    
    // Mapúa fallback
    if (valLower.includes('mapúa') || valLower.includes('mapua')) {
        return SCHOOL_CONTACT_DATA['Mapúa University'];
    }
    
    return null;
}

// ==========================================================================
// Wikipedia Logo Fetcher — pulls school logos from Wikipedia
// Uses JSONP (script injection) for API call + Image element for loading
// This works from file:// protocol unlike fetch() which gets CORS-blocked
// ==========================================================================

// Step 1: Get the Wikipedia page image URL via JSONP (no CORS issues)
function getWikipediaImageUrl(wikiTitle) {
    return new Promise((resolve) => {
        const callbackName = `wikiCb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const script = document.createElement('script');
        
        // Timeout fallback
        const timeout = setTimeout(() => {
            cleanup();
            resolve(null);
        }, 8000);
        
        function cleanup() {
            clearTimeout(timeout);
            delete window[callbackName];
            if (script.parentNode) script.parentNode.removeChild(script);
        }
        
        window[callbackName] = function(data) {
            cleanup();
            try {
                const pages = data.query && data.query.pages;
                if (!pages) { resolve(null); return; }
                const page = Object.values(pages)[0];
                if (page && page.thumbnail && page.thumbnail.source) {
                    // Request a larger thumbnail (300px)
                    const url = page.thumbnail.source.replace(/\/\d+px-/, '/300px-');
                    resolve(url);
                } else {
                    resolve(null);
                }
            } catch (e) {
                resolve(null);
            }
        };
        
        script.src = `https://en.wikipedia.org/w/api.php?action=query&titles=${wikiTitle}&prop=pageimages&format=json&pithumbsize=300&callback=${callbackName}`;
        script.onerror = () => { cleanup(); resolve(null); };
        document.head.appendChild(script);
    });
}

// Step 2: Load the image via <img> element and convert to base64 via Canvas
function loadImageAsBase64(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        const timeout = setTimeout(() => {
            resolve(null);
        }, 10000);
        
        img.onload = function() {
            clearTimeout(timeout);
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL('image/png');
                resolve(dataUrl);
            } catch (e) {
                console.warn('Canvas conversion failed:', e);
                resolve(null);
            }
        };
        
        img.onerror = function() {
            clearTimeout(timeout);
            resolve(null);
        };
        
        img.src = url;
    });
}

// Combined: fetch logo from Wikipedia and return base64
async function fetchLogoFromWikipedia(wikiTitle) {
    const cacheKey = `wiki_${wikiTitle}`;
    if (logoCache[cacheKey]) return logoCache[cacheKey];
    
    try {
        const imageUrl = await getWikipediaImageUrl(wikiTitle);
        if (!imageUrl) {
            console.warn('No Wikipedia image found for:', wikiTitle);
            return null;
        }
        
        const base64 = await loadImageAsBase64(imageUrl);
        if (base64) {
            logoCache[cacheKey] = base64;
        }
        return base64;
    } catch (e) {
        console.warn('Wikipedia logo fetch failed for', wikiTitle, e);
        return null;
    }
}

function handleSchoolNameLogoSync(stateKey, value) {
    if (!value) return;
    const valLower = value.toLowerCase();

    let matchedKey = null;
    if (valLower.includes('mapúa') || valLower.includes('mapua')) {
        matchedKey = 'Mapua';
    } else {
        for (const [key, school] of Object.entries(UNIVERSITY_LOGOS)) {
            if (school.name.toLowerCase() === valLower) {
                matchedKey = key;
                break;
            }
        }
    }

    // Use local LOGO_DATA for all schools (PH and US)
    if (matchedKey) {
        if (typeof LOGO_DATA !== 'undefined' && LOGO_DATA[matchedKey]) {
            state[stateKey] = LOGO_DATA[matchedKey];
        }
    }

    // Auto-update address, email, phone, and signatory from SCHOOL_CONTACT_DATA
    const matchedSchool = findSchoolData(value);

    if (matchedSchool) {
        if (stateKey === 'teacherLogo') {
            state.teacherAddress = matchedSchool.address;
            state.teacherEmail = matchedSchool.email;
            state.teacherPhone = matchedSchool.phone;
            // Auto-fill signatory (principal/head of school) for teacher docs
            if (matchedSchool.principal) {
                state.teacherRepName = matchedSchool.principal;
                state.teacherAutoSig = true;
            }
        } else if (stateKey === 'studentLogo') {
            state.studentAddress = matchedSchool.address;
            // Auto-fill signatory (registrar) for student docs
            if (matchedSchool.registrar) {
                state.studentRepName = matchedSchool.registrar;
                state.studentAutoSig = true;
            }
        }
    }

    saveState();
    populateInputsFromState();
    renderPreview();
}

function getLastName(fullName) {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    return parts[parts.length - 1];
}

// ==========================================================================
// 4. Debounce Utility
// ==========================================================================
function debounce(fn, ms = 150) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

// ==========================================================================
// 5. DOM References (set during init)
// ==========================================================================
let renderContent, studentDynamicFields, teacherDynamicFields, exportBtn, clearBtn, paperContainer;
let currentZoom = 100;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ==========================================================================
// 6. Tab Switching
// ==========================================================================
function activateTab(targetId) {
    $$('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.target === targetId);
    });
    $$('.form-module').forEach(mod => {
        mod.classList.toggle('active', mod.id === targetId);
    });
    state.activeModule = targetId;
    saveState();
    renderPreview();
}

// ==========================================================================
// 7. Dynamic Fields for Student Document Types
// ==========================================================================
function renderDynamicFields() {
    const type = state.studentDocType;
    let html = '';

    if (type === 'schedule') {
        html = `
            <div class="form-group">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                    <label for="student-schedule" style="margin-bottom: 0;">Schedule (one entry per line: Day - Time - Subject)</label>
                    <button type="button" onclick="randomizeSchedule()" class="secondary-btn" style="padding: 0.25rem 0.75rem; font-size: 0.75rem; display: flex; align-items: center; gap: 0.3rem;" title="Generate random schedule">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
                        Randomize
                    </button>
                </div>
                <textarea id="student-schedule" name="studentSchedule" rows="6"
                    placeholder="Monday - 8:00 AM - Mathematics&#10;Tuesday - 10:00 AM - Science&#10;Wednesday - 1:00 PM - English">${state.studentSchedule || ''}</textarea>
                <small>Each line becomes a row in the schedule table.</small>
            </div>
            <div class="form-group">
                <label for="student-units">Total Units</label>
                <input type="text" id="student-units" name="studentUnits" placeholder="18.0" value="${state.studentUnits || ''}">
            </div>`;
    } else if (type === 'receipt') {
        html = `
            <div class="form-group">
                <label for="student-receipt-no">Receipt Number</label>
                <input type="text" id="student-receipt-no" name="studentReceiptNo" placeholder="REC-00001" value="${state.studentReceiptNo || ''}">
            </div>
            <div class="form-group">
                <label for="student-amount">Tuition Amount</label>
                <input type="number" step="0.01" id="student-amount" name="studentAmount" placeholder="45000.00" value="${state.studentAmount || ''}">
            </div>
            <div class="form-group">
                <label for="student-payment-method">Payment Method</label>
                <select id="student-payment-method" name="studentPaymentMethod">
                    <option value="Cash" ${state.studentPaymentMethod === 'Cash' ? 'selected' : ''}>Cash</option>
                    <option value="Bank Transfer" ${state.studentPaymentMethod === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option>
                    <option value="Credit Card" ${state.studentPaymentMethod === 'Credit Card' ? 'selected' : ''}>Credit Card</option>
                    <option value="Check" ${state.studentPaymentMethod === 'Check' ? 'selected' : ''}>Check</option>
                </select>
            </div>`;
    } else if (type === 'proof') {
        html = `
            <div class="form-group">
                <label for="student-program">Program / Course</label>
                <input type="text" id="student-program" name="studentProgram" placeholder="Bachelor of Science in Computer Science" value="${state.studentProgram || ''}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="student-year-level">Year Level</label>
                    <select id="student-year-level" name="studentYearLevel">
                        <option value="1st Year" ${state.studentYearLevel === '1st Year' ? 'selected' : ''}>1st Year</option>
                        <option value="2nd Year" ${state.studentYearLevel === '2nd Year' ? 'selected' : ''}>2nd Year</option>
                        <option value="3rd Year" ${state.studentYearLevel === '3rd Year' ? 'selected' : ''}>3rd Year</option>
                        <option value="4th Year" ${state.studentYearLevel === '4th Year' ? 'selected' : ''}>4th Year</option>
                        <option value="5th Year" ${state.studentYearLevel === '5th Year' ? 'selected' : ''}>5th Year</option>
                        <option value="Graduate" ${state.studentYearLevel === 'Graduate' ? 'selected' : ''}>Graduate</option>
                    </select>
                </div>
            </div>`;
    } else if (type === 'idcard') {
        html = `
            <div class="form-group">
                <label for="student-program">Program / Course</label>
                <input type="text" id="student-program" name="studentProgram" placeholder="BS Computer Science" value="${state.studentProgram || ''}" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="student-year-level">Year Level</label>
                    <select id="student-year-level" name="studentYearLevel">
                        <option value="1st Year" ${state.studentYearLevel === '1st Year' ? 'selected' : ''}>1st Year</option>
                        <option value="2nd Year" ${state.studentYearLevel === '2nd Year' ? 'selected' : ''}>2nd Year</option>
                        <option value="3rd Year" ${state.studentYearLevel === '3rd Year' ? 'selected' : ''}>3rd Year</option>
                        <option value="4th Year" ${state.studentYearLevel === '4th Year' ? 'selected' : ''}>4th Year</option>
                        <option value="5th Year" ${state.studentYearLevel === '5th Year' ? 'selected' : ''}>5th Year</option>
                        <option value="Graduate" ${state.studentYearLevel === 'Graduate' ? 'selected' : ''}>Graduate</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="student-validuntil">Valid Until</label>
                    <input type="date" id="student-validuntil" name="studentValidUntil" value="${state.studentValidUntil || ''}" required>
                </div>
            </div>
            <div class="form-group">
                <label for="student-photo">Student Photo</label>
                <input type="file" id="student-photo" name="studentPhoto" accept="image/*">
                <small>For ID Card profile picture (2x2 recommended)</small>
            </div>
        `;
    }

    studentDynamicFields.innerHTML = html;
    bindDynamicInputs(studentDynamicFields);

    if (type === 'idcard') {
        handleFileUpload('student-photo', 'studentPhoto');
    }
}

// ==========================================================================
// 7b. Dynamic Fields for Teacher Document Types
// ==========================================================================
function renderTeacherDynamicFields() {
    const type = state.teacherDocType || 'coe';
    let html = '';

    if (type === 'coe') {
        html = `
            <div class="form-row">
                <div class="form-group">
                    <label for="teacher-certno">Certificate No.</label>
                    <input type="text" id="teacher-certno" name="teacherCertNo" placeholder="HR-2025-001" required>
                </div>
                <div class="form-group">
                    <label for="teacher-pronoun">Pronoun</label>
                    <select id="teacher-pronoun" name="teacherPronoun">
                        <option value="He/Him" ${state.teacherPronoun === 'He/Him' ? 'selected' : ''}>He/Him</option>
                        <option value="She/Her" ${state.teacherPronoun === 'She/Her' ? 'selected' : ''}>She/Her</option>
                        <option value="They/Them" ${state.teacherPronoun === 'They/Them' ? 'selected' : ''}>They/Them</option>
                        <option value="Other" ${state.teacherPronoun === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="teacher-title">Position/Title</label>
                    <input type="text" id="teacher-title" name="teacherTitle" placeholder="Senior Lecturer" required>
                </div>
                <div class="form-group">
                    <label for="teacher-type">Employment Type</label>
                    <select id="teacher-type" name="teacherType">
                        <option value="Full-Time" ${state.teacherType === 'Full-Time' ? 'selected' : ''}>Full-Time</option>
                        <option value="Part-Time" ${state.teacherType === 'Part-Time' ? 'selected' : ''}>Part-Time</option>
                        <option value="Contract" ${state.teacherType === 'Contract' ? 'selected' : ''}>Contract</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="teacher-startdate">Start Date</label>
                    <input type="date" id="teacher-startdate" name="teacherStartdate" required>
                </div>
                <div class="form-group">
                    <label for="teacher-issuedate">Issue Date</label>
                    <input type="date" id="teacher-issuedate" name="teacherIssuedate" required>
                </div>
            </div>

            <div class="form-group">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                    <label for="teacher-responsibilities" style="margin-bottom: 0;">Responsibilities</label>
                    <button type="button" onclick="randomizeResponsibilities()" class="secondary-btn" style="padding: 0.25rem 0.75rem; font-size: 0.75rem; display: flex; align-items: center; gap: 0.3rem;" title="Generate random responsibilities">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
                        Randomize
                    </button>
                </div>
                <textarea id="teacher-responsibilities" name="teacherResponsibilities" rows="4" placeholder="List core responsibilities..."></textarea>
            </div>
        `;
    } else if (type === 'payslip') {
        html = `
            <div class="form-row">
                <div class="form-group">
                    <label for="teacher-payperiod">Pay Period</label>
                    <input type="text" id="teacher-payperiod" name="teacherPayPeriod" placeholder="August 1 - 15, 2025" required>
                </div>
                <div class="form-group">
                    <label for="teacher-issuedate">Issue Date</label>
                    <input type="date" id="teacher-issuedate" name="teacherIssuedate" required>
                </div>
            </div>
            
            <h4 style="margin: 1rem 0 0.5rem; color: var(--primary-color);">Earnings</h4>
            <div class="form-row">
                <div class="form-group">
                    <label for="teacher-basicsalary">Basic Salary (₱)</label>
                    <input type="number" step="0.01" id="teacher-basicsalary" name="teacherBasicSalary" placeholder="25000.00" required>
                </div>
                <div class="form-group">
                    <label for="teacher-allowances">Allowances (₱)</label>
                    <input type="number" step="0.01" id="teacher-allowances" name="teacherAllowances" placeholder="3000.00" required>
                </div>
            </div>

            <h4 style="margin: 1rem 0 0.5rem; color: var(--primary-color);">Deductions</h4>
            <div class="form-row">
                <div class="form-group">
                    <label for="teacher-tax">Withholding Tax (₱)</label>
                    <input type="number" step="0.01" id="teacher-tax" name="teacherTax" placeholder="1500.00">
                </div>
                <div class="form-group">
                    <label for="teacher-sss">SSS (₱)</label>
                    <input type="number" step="0.01" id="teacher-sss" name="teacherSSS" placeholder="1125.00">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="teacher-philhealth">PhilHealth (₱)</label>
                    <input type="number" step="0.01" id="teacher-philhealth" name="teacherPhilhealth" placeholder="625.00">
                </div>
                <div class="form-group">
                    <label for="teacher-pagibig">Pag-IBIG (₱)</label>
                    <input type="number" step="0.01" id="teacher-pagibig" name="teacherPagibig" placeholder="200.00">
                </div>
            </div>
        `;
    } else if (type === 'license') {
        html = `
            <div class="form-row">
                <div class="form-group">
                    <label for="teacher-licenseno">License Number</label>
                    <input type="text" id="teacher-licenseno" name="teacherLicenseNo" placeholder="LPT-2018-789012" required>
                </div>
                <div class="form-group">
                    <label for="teacher-proftitle">Professional Title</label>
                    <input type="text" id="teacher-proftitle" name="teacherProfTitle" placeholder="Licensed Professional Teacher" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="teacher-regdate">Registration Date</label>
                    <input type="date" id="teacher-regdate" name="teacherRegDate" required>
                </div>
                <div class="form-group">
                    <label for="teacher-expdate">Expiration Date</label>
                    <input type="date" id="teacher-expdate" name="teacherExpDate" required>
                </div>
            </div>
            </div>
        `;
    } else if (type === 'idcard') {
        html = `
            <div class="form-row">
                <div class="form-group">
                    <label for="teacher-idnumber">ID Number</label>
                    <input type="text" id="teacher-idnumber" name="teacherIdNumber" placeholder="TCH-2025-001" required>
                </div>
                <div class="form-group">
                    <label for="teacher-title">Position/Title</label>
                    <input type="text" id="teacher-title" name="teacherTitle" placeholder="Computer Science Teacher" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="teacher-photo">Teacher Photo</label>
                    <input type="file" id="teacher-photo" name="teacherPhoto" accept="image/*">
                    <small>For ID Card profile picture</small>
                </div>
                <div class="form-group">
                    <label for="teacher-validuntil">Valid Until</label>
                    <input type="date" id="teacher-validuntil" name="teacherValidUntil" required>
                </div>
            </div>
        `;
    }

    teacherDynamicFields.innerHTML = html;
    populateInputsFromState(); // Populate just these new fields
    bindDynamicInputs(teacherDynamicFields);
    
    if (type === 'idcard') {
        handleFileUpload('teacher-photo', 'teacherPhoto');
    }
}

function bindDynamicInputs(container) {
    if (!container) return;
    const dynamicInputs = container.querySelectorAll('input, select, textarea');
    dynamicInputs.forEach(el => {
        el.addEventListener('input', debouncedUpdate);
        el.addEventListener('change', debouncedUpdate);
    });
}

// ==========================================================================
// 8. Input Binding & State Sync
// ==========================================================================
function syncInputsToState() {
    const allInputs = document.querySelectorAll('input[name], select[name], textarea[name]');
    allInputs.forEach(el => {
        if (el.type === 'file') return;
        const key = el.name;
        if (key && state.hasOwnProperty(key)) {
            if (el.type === 'checkbox') {
                state[key] = el.checked;
            } else {
                state[key] = el.value;
            }
        }
    });
}

function populateInputsFromState() {
    const allInputs = document.querySelectorAll('input[name], select[name], textarea[name]');
    allInputs.forEach(el => {
        if (el.type === 'file') return;
        const key = el.name;
        if (key && state[key] !== undefined) {
            if (el.type === 'checkbox') {
                el.checked = !!state[key];
            } else {
                el.value = state[key];
            }
        }
    });

    const syncDropdown = (selectId, inputId, stateKey) => {
        const selectEl = document.getElementById(selectId);
        const inputEl = document.getElementById(inputId);
        if (selectEl && inputEl && state[stateKey]) {
            const options = Array.from(selectEl.options).map(opt => opt.value);
            if (options.includes(state[stateKey])) {
                selectEl.value = state[stateKey];
                inputEl.style.display = 'none';
            } else {
                selectEl.value = 'Other';
                inputEl.style.display = 'block';
            }
        }
    };
    syncDropdown('student-school-select', 'student-school', 'studentSchool');
    syncDropdown('teacher-school-select', 'teacher-school', 'teacherSchool');
}

function handleInputChange() {
    syncInputsToState();
    saveState();
    renderPreview();

    // Re-render dynamic fields if doc type changed
    const studentDocTypeEl = $('#student-doc-type');
    if (studentDocTypeEl && studentDocTypeEl.value !== state._lastStudentDocType) {
        state._lastStudentDocType = studentDocTypeEl.value;
        renderDynamicFields();
    }
    
    const teacherDocTypeEl = $('#teacher-doc-type');
    if (teacherDocTypeEl && teacherDocTypeEl.value !== state._lastTeacherDocType) {
        state._lastTeacherDocType = teacherDocTypeEl.value;
        renderTeacherDynamicFields();
    }
}

const debouncedUpdate = debounce(handleInputChange, 100);

function bindAllInputs() {
    const allInputs = document.querySelectorAll('input[name], select[name], textarea[name]');
    allInputs.forEach(el => {
        if (el.type === 'file') return;
        el.addEventListener('input', debouncedUpdate);
        el.addEventListener('change', debouncedUpdate);
    });
}

// ==========================================================================
// 9. File Upload Handling (Base64 via FileReader)
// ==========================================================================
function handleFileUpload(inputId, stateKey, removeBtnId) {
    const input = document.getElementById(inputId);
    const removeBtn = removeBtnId ? document.getElementById(removeBtnId) : null;
    if (!input) return;

    if (removeBtn) {
        removeBtn.style.display = state[stateKey] ? 'inline-block' : 'none';
        removeBtn.addEventListener('click', () => {
            state[stateKey] = '';
            input.value = '';
            removeBtn.style.display = 'none';
            saveState();
            renderPreview();
        });
    }

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) {
            state[stateKey] = '';
            if (removeBtn) removeBtn.style.display = 'none';
            saveState();
            renderPreview();
            return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
            state[stateKey] = evt.target.result;
            if (removeBtn) removeBtn.style.display = 'inline-block';
            saveState();
            renderPreview();
        };
        reader.readAsDataURL(file);
    });
}

function initFileUploads() {
    handleFileUpload('custom-logo', 'customLogo');
    handleFileUpload('student-logo', 'studentLogo');
    handleFileUpload('teacher-logo', 'teacherLogo');
    handleFileUpload('student-signature', 'studentSignature', 'student-sig-remove');
    handleFileUpload('teacher-signature', 'teacherSignature', 'teacher-sig-remove');
}

// ==========================================================================
// 10. Live Preview Rendering
// ==========================================================================
function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderPreview() {
    if (!renderContent) return;
    
    // Check if it should be landscape or id-card
    const docRender = document.getElementById('document-render');
    if (docRender) {
        docRender.classList.remove('landscape', 'id-card');
        if (state.activeModule === 'teacher-module') {
            if (state.teacherDocType === 'license') {
                docRender.classList.add('landscape');
            } else if (state.teacherDocType === 'idcard') {
                docRender.classList.add('id-card');
            }
        } else if (state.activeModule === 'student-module') {
            if (state.studentDocType === 'idcard') {
                docRender.classList.add('id-card');
            }
        }
    }

    if (state.activeModule === 'student-module') {
        renderStudentPreview();
    } else {
        renderTeacherPreview();
    }

    // QR Code Generation
    const qrPlaceholder = renderContent.querySelector('.qr-placeholder');
    if (qrPlaceholder) {
        if (state.qrEnabled) {
            qrPlaceholder.innerHTML = '';
            qrPlaceholder.style.display = 'block';
            let verifyStr = '';
            if (state.activeModule === 'student-module') {
                verifyStr = 'Verified: Student - ' + (state.studentSchool || 'Unknown');
            } else {
                verifyStr = 'Verified: Teacher - ' + (state.teacherSchool || 'Unknown');
            }
            new QRCode(qrPlaceholder, {
                text: verifyStr,
                width: 60,
                height: 60,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.L
            });
        } else {
            qrPlaceholder.style.display = 'none';
        }
    }
}

function renderStudentPreview() {
    const type = state.studentDocType;
    const logoHtml = (state.customLogo || state.studentLogo)
        ? `<img src="${(state.customLogo || state.studentLogo)}" alt="School Logo" class="doc-logo">`
        : `<div class="doc-logo" style="width:80px;height:80px;border:2px dashed #ccc;display:flex;align-items:center;justify-content:center;font-size:0.7rem;color:#aaa;border-radius:8px;">Logo</div>`;

    let bodyHtml = '';

    if (type === 'schedule') {
        bodyHtml = renderScheduleBody();
    } else if (type === 'receipt') {
        bodyHtml = renderReceiptBody();
    } else if (type === 'proof') {
        bodyHtml = renderProofBody();
    } else if (type === 'idcard') {
        // ID card uses a specialized portrait layout (3.4in x 5.4in)
        renderContent.innerHTML = renderStudentIDBody();
        return;
    }

    const titleMap = {
        schedule: 'OFFICIAL CLASS SCHEDULE',
        receipt: 'OFFICIAL TUITION RECEIPT',
        proof: 'CERTIFICATE OF ENROLLMENT',
    };

    const watermarkHtml = (state.customLogo || state.studentLogo)
        ? `<img src="${(state.customLogo || state.studentLogo)}" alt="Watermark" class="doc-watermark">`
        : '';
        
    // Generate a consistent pseudo-random control number based on Student ID
    const ctrlNo = state.studentId ? state.studentId.replace(/\D/g, '') || '849201' : '849201';
    const refNum = 'REF-' + Math.floor(Math.random() * 900000 + 100000);
    
    if (state.studentTemplate === 'modern') {
        renderContent.innerHTML = `
            ${watermarkHtml}
            <!-- Modern Header Banner -->
            <div class="doc-header-modern" style="background-color: var(--primary-color); color: white; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-radius: 8px 8px 0 0; margin-bottom: 2rem;">
                <div class="doc-school-info-modern" style="text-align: left;">
                    <div class="doc-school-name" style="font-size: 1.5rem; font-weight: 800; text-transform: uppercase;">${escapeHtml(state.studentSchool || 'School Name')}</div>
                    <div class="doc-school-details" style="color: rgba(255,255,255,0.8); margin-top: 4px;">Term: ${escapeHtml(state.studentSemester || '—')} | AY ${escapeHtml(state.studentAcademicYear || '—')}</div>
                </div>
                <div style="background: white; padding: 8px; border-radius: 4px;">
                    ${(state.customLogo || state.studentLogo) ? `<img src="${(state.customLogo || state.studentLogo)}" alt="School Logo" style="height: 60px; object-fit: contain;">` : `<div style="color:var(--primary-color); font-weight:bold; height:60px; display:flex; align-items:center;">LOGO</div>`}
                </div>
            </div>
            
            <div class="doc-title-modern" style="border-left: 5px solid var(--primary-color); padding-left: 1rem; margin-bottom: 1.5rem; font-size: 1.4rem; font-weight: 800; text-transform: uppercase; color: #1e293b;">
                ${titleMap[type]}
            </div>
            
            <div class="student-info-modern" style="display: flex; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 1.5rem;">
                <div style="flex: 1; min-width: 200px;">
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Student Name</div>
                    <div style="font-size: 1.1rem; font-weight: 700; color: #0f172a;">${escapeHtml(state.studentFname || '—')} ${escapeHtml(state.studentLname || '')}</div>
                </div>
                <div style="flex: 1; min-width: 150px;">
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Student ID</div>
                    <div style="font-size: 1.1rem; font-weight: 700; color: #0f172a;">${escapeHtml(state.studentId || '—')}</div>
                </div>
                <div style="flex: 1; min-width: 200px;">
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Program / Course</div>
                    <div style="font-size: 1.1rem; font-weight: 700; color: #0f172a;">${escapeHtml(state.studentProgram || '—')}</div>
                </div>
            </div>
            
            ${bodyHtml}
            
            <div style="margin-top: 3rem; text-align: right; color: #94a3b8; font-size: 0.75rem;">
                CTRL: ${ctrlNo} | REF: ${refNum} | PRINTED: ${new Date().toLocaleDateString()}
            </div>
        `;
    } else if (state.studentTemplate === 'minimalist') {
        renderContent.innerHTML = `
            ${watermarkHtml}
            <div style="font-family: 'Inter', sans-serif; color: #333;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    ${(state.customLogo || state.studentLogo) ? `<img src="${(state.customLogo || state.studentLogo)}" alt="School Logo" style="height: 50px; object-fit: contain; margin-bottom: 1rem;">` : ''}
                    <div style="font-size: 1.2rem; letter-spacing: 2px; text-transform: uppercase;">${escapeHtml(state.studentSchool || 'School Name')}</div>
                    <div style="font-size: 0.85rem; color: #777; margin-top: 0.5rem; letter-spacing: 1px;">TERM: ${escapeHtml(state.studentSemester || '—')} &nbsp;|&nbsp; AY: ${escapeHtml(state.studentAcademicYear || '—')}</div>
                </div>
                
                <div style="text-align: center; font-size: 1.5rem; font-weight: 300; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 2.5rem; border-bottom: 1px solid #eaeaea; padding-bottom: 1rem;">
                    ${titleMap[type]}
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 3rem; font-size: 0.9rem;">
                    <div>
                        <div style="color: #888; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Student</div>
                        <div style="font-weight: 500;">${escapeHtml(state.studentFname || '—')} ${escapeHtml(state.studentLname || '')}</div>
                    </div>
                    <div>
                        <div style="color: #888; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">ID Number</div>
                        <div style="font-weight: 500;">${escapeHtml(state.studentId || '—')}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: #888; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Program</div>
                        <div style="font-weight: 500;">${escapeHtml(state.studentProgram || '—')}</div>
                    </div>
                </div>
                
                ${bodyHtml}
                
                <div style="margin-top: 4rem; text-align: center; border-top: 1px solid #eaeaea; padding-top: 1rem; color: #aaa; font-size: 0.7rem; letter-spacing: 1px;">
                    CTRL: ${ctrlNo} &nbsp;&middot;&nbsp; REF: ${refNum} &nbsp;&middot;&nbsp; ${new Date().toLocaleDateString()}
                </div>
            </div>
        `;
    } else if (state.studentTemplate === 'corporate') {
        renderContent.innerHTML = `
            ${watermarkHtml}
            <div style="font-family: 'Arial', sans-serif; color: #1a202c;">
                <div style="display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 3px solid #0f172a; padding-bottom: 1.5rem; margin-bottom: 2rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        ${(state.customLogo || state.studentLogo) ? `<img src="${(state.customLogo || state.studentLogo)}" alt="School Logo" style="height: 65px; object-fit: contain;">` : `<div style="width: 65px; height: 65px; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold;">LOGO</div>`}
                        <div>
                            <div style="font-size: 1.4rem; font-weight: 800; color: #0f172a; text-transform: uppercase;">${escapeHtml(state.studentSchool || 'School Name')}</div>
                            <div style="font-size: 0.9rem; color: #475569; margin-top: 4px; font-weight: 600;">Office of the Registrar</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.85rem; color: #64748b; font-weight: bold;">AY ${escapeHtml(state.studentAcademicYear || '—')}</div>
                        <div style="font-size: 0.85rem; color: #64748b;">${escapeHtml(state.studentSemester || '—')}</div>
                    </div>
                </div>
                
                <div style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 1rem; margin-bottom: 2rem; display: flex; justify-content: space-between;">
                    <div>
                        <div style="font-size: 0.75rem; color: #64748b; font-weight: bold; text-transform: uppercase;">Student Information</div>
                        <div style="font-size: 1.1rem; font-weight: 800; color: #0f172a; margin-top: 4px;">${escapeHtml(state.studentFname || '—')} ${escapeHtml(state.studentLname || '')}</div>
                        <div style="font-size: 0.9rem; color: #334155; margin-top: 2px;">${escapeHtml(state.studentId || '—')} &nbsp;|&nbsp; ${escapeHtml(state.studentProgram || '—')}</div>
                    </div>
                    <div style="text-align: right; align-self: flex-end;">
                        <div style="font-size: 1.2rem; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 1px;">${titleMap[type]}</div>
                    </div>
                </div>
                
                ${bodyHtml}
                
                <div style="margin-top: 3rem; border-top: 2px solid #0f172a; padding-top: 1rem; display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; font-weight: bold;">
                    <div>DOCUMENT NO: ${ctrlNo}-${refNum}</div>
                    <div>ISSUED: ${new Date().toLocaleDateString()}</div>
                </div>
            </div>
        `;
    } else {
        renderContent.innerHTML = `
            ${watermarkHtml}
            
            <!-- System Print Header -->
            <div style="font-family: monospace; font-size: 0.55rem; color: #94a3b8; display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 0.5rem; margin-bottom: 1rem;">
                <span>SYS_ID: MAPUA_SIS_PROD</span>
                <span>DATE PRINTED: ${new Date().toLocaleString()}</span>
            </div>

            <div class="doc-header" style="position: relative; align-items: flex-start; flex-wrap: nowrap;">
                ${logoHtml}
                <div class="doc-school-info" style="flex: 1; text-align: center; padding: 0 1rem;">
                    <div class="doc-school-name" style="font-size: 1.3rem; line-height: 1.2;">${escapeHtml(state.studentSchool || 'School Name').toUpperCase()}</div>
                    <div class="doc-school-details" style="margin-top: 4px;">Term: ${escapeHtml(state.studentSemester || '—')} | AY ${escapeHtml(state.studentAcademicYear || '—')}</div>
                    <div class="doc-school-details" style="color: #15803d; font-weight: 800; margin-top: 4px; letter-spacing: 0.5px;">STATUS: OFFICIALLY ENROLLED</div>
                </div>
                
                <!-- Document Control Number -->
                <div style="text-align: right; min-width: 150px; flex-shrink: 0; margin-top: 10px;">
                    <div style="font-size: 0.75rem; font-family: monospace; color: #475569; letter-spacing: 1px; font-weight: bold;">CTRL: ${ctrlNo}</div>
                </div>
            </div>
            
            <div class="doc-title" style="border-bottom: 2px solid #1e293b; padding-bottom: 0.5rem; margin-bottom: 1rem; font-size: 1.3rem;">${titleMap[type]}</div>
            
            <div class="student-info-grid" style="display: grid; grid-template-columns: 120px 1fr 90px 1fr; gap: 0.5rem 1rem; background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.75rem 1rem; border-radius: 4px; margin-bottom: 1rem; align-items: baseline;">
                <span class="info-label" style="font-family: monospace; font-size: 0.7rem; color: #475569;">STUDENT NAME:</span>
                <span style="font-weight: 800; font-size: 0.95rem; text-transform: uppercase;">${escapeHtml(state.studentFname || '—')} ${escapeHtml(state.studentLname || '')}</span>
                
                <span class="info-label" style="font-family: monospace; font-size: 0.7rem; color: #475569;">STUDENT ID:</span>
                <span style="font-weight: bold; font-size: 0.95rem;">${escapeHtml(state.studentId || '—')}</span>
                
                <span class="info-label" style="font-family: monospace; font-size: 0.7rem; color: #475569;">PROGRAM/COURSE:</span>
                <span style="font-weight: bold; font-size: 0.95rem; text-transform: uppercase;">${escapeHtml(state.studentProgram || '—')}</span>
                
                <span class="info-label" style="font-family: monospace; font-size: 0.7rem; color: #475569;">YEAR LEVEL:</span>
                <span style="font-weight: bold; font-size: 0.95rem;">${escapeHtml(state.studentYearLevel || '—')}</span>
                
                <span class="info-label" style="font-family: monospace; font-size: 0.7rem; color: #475569;">REGISTRATION DATE:</span>
                <span style="font-weight: bold; font-size: 0.95rem;">${formatDate(state.studentDate)}</span>
                
                <span class="info-label" style="font-family: monospace; font-size: 0.7rem; color: #475569;">RECEIPT NO:</span>
                <span style="font-weight: bold; font-size: 0.95rem;">${escapeHtml(state.studentReceiptNo || '—')}</span>
            </div>
            
            ${bodyHtml}
            
            <!-- System Print Footer -->
            <div style="position: absolute; bottom: -0.25in; left: 0; right: 0; font-family: monospace; font-size: 0.6rem; color: #94a3b8; display: flex; justify-content: space-between; border-top: 1px dashed #cbd5e1; padding-top: 0.5rem; letter-spacing: 0.5px;">
                <span>https://my.mapua.edu.ph/Student/Enrollment/Print.aspx</span>
                <span>Page 1 of 1</span>
                <span>${refNum}</span>
            </div>
        `;
    }
}

function renderScheduleBody() {
    const lines = (state.studentSchedule || '').split('\n').filter(l => l.trim());
    let rows = '';

    if (lines.length === 0) {
        rows = `<tr><td colspan="3" style="text-align:center;color:#999;padding:2rem;">Enter schedule data in the form</td></tr>`;
    } else {
        lines.forEach(line => {
            const parts = line.split('-').map(p => p.trim());
            const day = parts[0] || '';
            const time = parts[1] || '';
            const subject = parts.slice(2).join(' - ').trim() || '';
            rows += `<tr><td>${escapeHtml(day)}</td><td>${escapeHtml(time)}</td><td>${escapeHtml(subject)}</td></tr>`;
        });
    }

    let sigHtml = '';
    if (state.studentSignature) {
        sigHtml = `<img src="${state.studentSignature}" alt="Signature" class="sig-image">`;
    } else if (state.studentAutoSig && state.studentRepName) {
        sigHtml = `<div class="auto-signature">${escapeHtml(getLastName(state.studentRepName))}</div>`;
    }
    const sigNameHtml = state.studentRepName ? escapeHtml(state.studentRepName) : 'Registrar Name';

    return `
        <table class="schedule-table" style="width: 100%; border-collapse: collapse; font-family: 'Inter', sans-serif; font-size: 0.85rem; margin-bottom: 1rem;">
            <thead>
                <tr style="background-color: #1e293b; color: white;">
                    <th style="padding: 0.5rem; text-align: left; border: 1px solid #1e293b; background-color: #1e293b; color: white;">DAY</th>
                    <th style="padding: 0.5rem; text-align: left; border: 1px solid #1e293b; background-color: #1e293b; color: white;">TIME</th>
                    <th style="padding: 0.5rem; text-align: left; border: 1px solid #1e293b; background-color: #1e293b; color: white;">SUBJECT / COURSE</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
                <tr style="background-color: #f8fafc;">
                    <td colspan="2" style="text-align: right; font-weight: bold; padding: 0.5rem; border: 1px solid #e2e8f0;">TOTAL REGISTERED UNITS:</td>
                    <td style="font-weight: bold; padding: 0.5rem; border: 1px solid #e2e8f0; color: #15803d;">${escapeHtml(state.studentUnits || '0.0')}</td>
                </tr>
            </tfoot>
        </table>
        
        <div class="letter-body" style="font-size: 0.8rem; color: #475569; margin-bottom: 1rem;">
            <p><strong>NOTICE:</strong> This is a system-generated document. Alteration of this document is strictly prohibited and may result in disciplinary action. This schedule is valid for the term specified above.</p>
        </div>
        
        <div class="signature-wrapper" style="text-align: right; margin-top: 1rem;">
            <div class="signature-block" style="display: inline-block; text-align: center; min-width: 280px;">
                ${sigHtml}
                <div class="sig-line" style="margin-top: 0; width: 100%; border-color: #1e293b;"></div>
                <div class="sig-name" style="font-weight: 800; text-transform: uppercase; font-size: 0.95rem; letter-spacing: 1px;">${sigNameHtml}</div>
                <div class="sig-title" style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">University Registrar</div>
            </div>
        </div>`;
}

function renderReceiptBody() {
    let sigHtml = '';
    if (state.studentSignature) {
        sigHtml = `<img src="${state.studentSignature}" alt="Signature" class="sig-image">`;
    } else if (state.studentAutoSig && state.studentRepName) {
        sigHtml = `<div class="auto-signature">${escapeHtml(getLastName(state.studentRepName))}</div>`;
    }
    const sigNameHtml = state.studentRepName ? `<div class="sig-name">${escapeHtml(state.studentRepName)}</div>` : '';
    const amount = state.studentAmount || '0';
    const payMethod = escapeHtml(state.studentPaymentMethod || 'Cash');
    const receiptNo = escapeHtml(state.studentReceiptNo || 'REC-2025-00347');
    const template = state.studentTemplate;

    if (template === 'modern') {
        return `
            <div style="margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div style="font-size: 0.7rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Payment Summary</div>
                    <div style="font-size: 0.7rem; color: #64748b;">Receipt #: <strong style="color: #0f172a;">${receiptNo}</strong></div>
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                    <thead>
                        <tr style="background: var(--primary-color, #1e3a5f); color: white;">
                            <th style="padding: 0.6rem 1rem; text-align: left; font-weight: 600;">Description</th>
                            <th style="padding: 0.6rem 1rem; text-align: right; font-weight: 600;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 0.6rem 1rem; color: #334155;">Tuition Fee</td>
                            <td style="padding: 0.6rem 1rem; text-align: right; font-weight: 600; color: #0f172a;">${formatCurrency(amount)}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 0.6rem 1rem; color: #334155;">Miscellaneous Fees</td>
                            <td style="padding: 0.6rem 1rem; text-align: right; color: #64748b;">Included</td>
                        </tr>
                        <tr style="background: #f8fafc;">
                            <td style="padding: 0.75rem 1rem; font-weight: 800; color: #0f172a; font-size: 0.95rem;">TOTAL AMOUNT PAID</td>
                            <td style="padding: 0.75rem 1rem; text-align: right; font-weight: 800; font-size: 1.2rem; color: var(--primary-color, #1e3a5f);">${formatCurrency(amount)}</td>
                        </tr>
                    </tbody>
                </table>
                <div style="display: flex; gap: 1.5rem; margin-top: 1rem; padding: 0.75rem 1rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
                    <div style="flex: 1;">
                        <div style="font-size: 0.65rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Payment Method</div>
                        <div style="font-size: 0.9rem; font-weight: 700; color: #0f172a; margin-top: 2px;">${payMethod}</div>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-size: 0.65rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Payment Status</div>
                        <div style="font-size: 0.9rem; font-weight: 800; color: #15803d; margin-top: 2px;">✓ FULLY PAID</div>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-size: 0.65rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Date</div>
                        <div style="font-size: 0.9rem; font-weight: 700; color: #0f172a; margin-top: 2px;">${formatDate(state.studentDate)}</div>
                    </div>
                </div>
            </div>
            <div style="margin-top: 2rem; text-align: right;">
                <div style="display: inline-block; text-align: center; min-width: 250px;">
                    ${sigHtml}
                    <div style="border-top: 2px solid #1e293b; margin-top: 0.4rem; padding-top: 0.3rem;"></div>
                    ${sigNameHtml}
                    <div style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">Authorized Signatory</div>
                </div>
            </div>`;
    } else if (template === 'minimalist') {
        return `
            <div style="margin-bottom: 2rem;">
                <div style="border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; margin-bottom: 1.5rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #e5e7eb;">
                        <div style="padding: 0.75rem 1rem; border-right: 1px solid #e5e7eb;">
                            <div style="font-size: 0.6rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px;">Receipt No.</div>
                            <div style="font-size: 0.9rem; font-weight: 600; color: #111; margin-top: 2px; font-family: 'Courier New', monospace;">${receiptNo}</div>
                        </div>
                        <div style="padding: 0.75rem 1rem;">
                            <div style="font-size: 0.6rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px;">Payment Date</div>
                            <div style="font-size: 0.9rem; font-weight: 600; color: #111; margin-top: 2px;">${formatDate(state.studentDate)}</div>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #e5e7eb;">
                        <div style="padding: 0.75rem 1rem; border-right: 1px solid #e5e7eb;">
                            <div style="font-size: 0.6rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px;">Payment Method</div>
                            <div style="font-size: 0.9rem; font-weight: 600; color: #111; margin-top: 2px;">${payMethod}</div>
                        </div>
                        <div style="padding: 0.75rem 1rem;">
                            <div style="font-size: 0.6rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px;">Status</div>
                            <div style="font-size: 0.9rem; font-weight: 700; color: #15803d; margin-top: 2px;">Fully Paid</div>
                        </div>
                    </div>
                    <div style="padding: 1rem; background: #fafafa; display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 0.85rem; color: #6b7280;">Total Amount</div>
                        <div style="font-size: 1.5rem; font-weight: 300; color: #111; letter-spacing: -0.5px;">${formatCurrency(amount)}</div>
                    </div>
                </div>
                <p style="font-size: 0.8rem; color: #9ca3af; font-style: italic; text-align: center;">This receipt confirms that tuition payment has been received in full.</p>
            </div>
            <div style="margin-top: 3rem; display: flex; justify-content: flex-end;">
                <div style="text-align: center; min-width: 220px;">
                    ${sigHtml}
                    <div style="border-top: 1px solid #d1d5db; margin-top: 0.4rem; padding-top: 0.3rem;"></div>
                    ${sigNameHtml}
                    <div style="font-size: 0.7rem; color: #9ca3af;">Authorized Signatory</div>
                </div>
            </div>`;
    } else if (template === 'corporate') {
        return `
            <div style="margin-bottom: 1.5rem;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; border: 1px solid #cbd5e1;">
                    <thead>
                        <tr style="background: #0f172a; color: white;">
                            <th style="padding: 0.6rem 1rem; text-align: left; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px;">Item</th>
                            <th style="padding: 0.6rem 1rem; text-align: center; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px;">Status</th>
                            <th style="padding: 0.6rem 1rem; text-align: right; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 0.6rem 1rem; font-weight: 600;">Tuition Fee</td>
                            <td style="padding: 0.6rem 1rem; text-align: center; color: #15803d; font-weight: 700;">PAID</td>
                            <td style="padding: 0.6rem 1rem; text-align: right; font-weight: 600;">${formatCurrency(amount)}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                            <td style="padding: 0.6rem 1rem;">Miscellaneous Fees</td>
                            <td style="padding: 0.6rem 1rem; text-align: center; color: #15803d; font-weight: 700;">PAID</td>
                            <td style="padding: 0.6rem 1rem; text-align: right; color: #64748b;">Included</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr style="background: #0f172a; color: white;">
                            <td colspan="2" style="padding: 0.75rem 1rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Total Amount Paid</td>
                            <td style="padding: 0.75rem 1rem; text-align: right; font-weight: 800; font-size: 1.1rem;">${formatCurrency(amount)}</td>
                        </tr>
                    </tfoot>
                </table>
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <div style="flex: 1; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 0.6rem 0.85rem;">
                        <div style="font-size: 0.6rem; color: #64748b; text-transform: uppercase; font-weight: 700;">Receipt No.</div>
                        <div style="font-size: 0.85rem; font-weight: 700; color: #0f172a; margin-top: 2px;">${receiptNo}</div>
                    </div>
                    <div style="flex: 1; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 0.6rem 0.85rem;">
                        <div style="font-size: 0.6rem; color: #64748b; text-transform: uppercase; font-weight: 700;">Method</div>
                        <div style="font-size: 0.85rem; font-weight: 700; color: #0f172a; margin-top: 2px;">${payMethod}</div>
                    </div>
                    <div style="flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 0.6rem 0.85rem;">
                        <div style="font-size: 0.6rem; color: #15803d; text-transform: uppercase; font-weight: 700;">Status</div>
                        <div style="font-size: 0.85rem; font-weight: 800; color: #15803d; margin-top: 2px;">✓ FULLY PAID</div>
                    </div>
                </div>
            </div>
            <div style="margin-top: 2.5rem; text-align: right;">
                <div style="display: inline-block; text-align: center; min-width: 250px;">
                    ${sigHtml}
                    <div style="border-top: 2px solid #0f172a; margin-top: 0.4rem; padding-top: 0.3rem;"></div>
                    ${sigNameHtml}
                    <div style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">Authorized Signatory</div>
                </div>
            </div>`;
    }

    // Classic fallback
    return `
        <div class="receipt-box">
            <p style="font-size: 0.9rem; font-weight: bold; color: #475569; text-transform: uppercase;">Amount Paid</p>
            <div class="receipt-amount">${formatCurrency(amount)}</div>
            <p style="margin-top:1rem;font-size:0.875rem;color:#555;">Payment Method: <strong>${payMethod}</strong></p>
            <p style="margin-top:0.5rem;font-size:0.875rem;color:#555;">Payment Status: <strong style="color: #15803d; letter-spacing: 0.5px;">FULLY PAID</strong></p>
            <p style="margin-top:0.5rem;font-size:0.875rem;color:#555;">This receipt confirms tuition payment has been received in full.</p>
        </div>
        <div class="signature-wrapper" style="text-align: right; margin-top: 3rem;">
            <div class="signature-block" style="display: inline-block; text-align: center; min-width: 280px;">
                ${sigHtml}
                <div class="sig-line" style="margin-top: 0; width: 100%; border-color: #1e293b;"></div>
                <div class="sig-name" style="font-weight: 800; text-transform: uppercase; font-size: 0.95rem; letter-spacing: 1px;">${sigNameHtml}</div>
                <div class="sig-title" style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">Authorized Signatory</div>
            </div>
        </div>`;
}

function renderProofBody() {
    let sigHtml = '';
    if (state.studentSignature) {
        sigHtml = `<img src="${state.studentSignature}" alt="Signature" class="sig-image">`;
    } else if (state.studentAutoSig && state.studentRepName) {
        sigHtml = `<div class="auto-signature">${escapeHtml(getLastName(state.studentRepName))}</div>`;
    }
    const sigNameHtml = state.studentRepName ? escapeHtml(state.studentRepName) : 'Registrar Name';
    const template = state.studentTemplate;
    const studentName = `${escapeHtml(state.studentFname || '—')} ${escapeHtml(state.studentLname || '')}`;
    const program = escapeHtml(state.studentProgram || '—');
    const semester = escapeHtml(state.studentSemester || '—');
    const academicYear = escapeHtml(state.studentAcademicYear || '—');
    const yearLevel = escapeHtml(state.studentYearLevel || '—');
    const studentId = escapeHtml(state.studentId || '—');

    if (template === 'modern') {
        return `
            <div style="margin-bottom: 1.5rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem;">
                    <div style="background: #f8fafc; border-left: 3px solid var(--primary-color, #1e3a5f); padding: 0.65rem 0.85rem;">
                        <div style="font-size: 0.6rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Student ID</div>
                        <div style="font-size: 0.9rem; font-weight: 700; color: #0f172a; margin-top: 2px; font-family: 'Courier New', monospace;">${studentId}</div>
                    </div>
                    <div style="background: #f8fafc; border-left: 3px solid var(--primary-color, #1e3a5f); padding: 0.65rem 0.85rem;">
                        <div style="font-size: 0.6rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Year Level</div>
                        <div style="font-size: 0.9rem; font-weight: 700; color: #0f172a; margin-top: 2px;">${yearLevel}</div>
                    </div>
                    <div style="background: #f0fdf4; border-left: 3px solid #15803d; padding: 0.65rem 0.85rem;">
                        <div style="font-size: 0.6rem; color: #15803d; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Enrollment Status</div>
                        <div style="font-size: 0.9rem; font-weight: 800; color: #15803d; margin-top: 2px;">✓ OFFICIALLY ENROLLED</div>
                    </div>
                </div>
                <div style="font-size: 0.95rem; color: #334155; line-height: 1.8; text-align: justify;">
                    <p>This is to certify that <strong style="color: #0f172a;">${studentName}</strong> is officially enrolled in the <strong>${program}</strong> program for the <strong>${semester}</strong> of Academic Year <strong>${academicYear}</strong>.</p>
                    <p>This certification is issued upon the request of the student for whatever legal purpose it may serve.</p>
                    <p style="margin-top: 1.5rem;">Issued this <strong>${formatDate(state.studentDate)}</strong>.</p>
                </div>
            </div>
            <div style="margin-top: 2.5rem; text-align: right;">
                <div style="display: inline-block; text-align: center; min-width: 250px;">
                    ${sigHtml}
                    <div style="border-top: 2px solid #1e293b; margin-top: 0.4rem; padding-top: 0.3rem;"></div>
                    <div style="font-weight: 800; text-transform: uppercase; font-size: 0.95rem; letter-spacing: 1px;">${sigNameHtml}</div>
                    <div style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">University Registrar</div>
                </div>
            </div>`;
    } else if (template === 'minimalist') {
        return `
            <div style="margin-bottom: 2rem;">
                <div style="border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; margin-bottom: 2rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #e5e7eb;">
                        <div style="padding: 0.7rem 1rem; border-right: 1px solid #e5e7eb;">
                            <div style="font-size: 0.55rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px;">Student ID</div>
                            <div style="font-size: 0.85rem; font-weight: 600; color: #111; margin-top: 2px; font-family: 'Courier New', monospace;">${studentId}</div>
                        </div>
                        <div style="padding: 0.7rem 1rem;">
                            <div style="font-size: 0.55rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px;">Year Level</div>
                            <div style="font-size: 0.85rem; font-weight: 600; color: #111; margin-top: 2px;">${yearLevel}</div>
                        </div>
                    </div>
                    <div style="padding: 0.7rem 1rem; background: #fafafa; display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 0.75rem; color: #6b7280;">Enrollment Status</div>
                        <div style="font-size: 0.85rem; font-weight: 700; color: #15803d;">Officially Enrolled</div>
                    </div>
                </div>
                <div style="font-size: 0.95rem; color: #374151; line-height: 1.9;">
                    <p>This is to certify that <strong>${studentName}</strong> is officially enrolled in the <strong>${program}</strong> program for the <strong>${semester}</strong> of Academic Year <strong>${academicYear}</strong>.</p>
                    <p>This certification is issued upon the request of the student for whatever legal purpose it may serve.</p>
                    <p style="margin-top: 1.5rem;">Issued this <strong>${formatDate(state.studentDate)}</strong>.</p>
                </div>
            </div>
            <div style="margin-top: 3rem; display: flex; justify-content: flex-end;">
                <div style="text-align: center; min-width: 220px;">
                    ${sigHtml}
                    <div style="border-top: 1px solid #d1d5db; margin-top: 0.4rem; padding-top: 0.3rem;"></div>
                    <div style="font-weight: 600; font-size: 0.9rem;">${sigNameHtml}</div>
                    <div style="font-size: 0.7rem; color: #9ca3af;">University Registrar</div>
                </div>
            </div>`;
    } else if (template === 'corporate') {
        return `
            <div style="margin-bottom: 1.5rem;">
                <div style="display: flex; gap: 0.75rem; margin-bottom: 1.5rem;">
                    <div style="flex: 1; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 0.6rem 0.85rem;">
                        <div style="font-size: 0.6rem; color: #64748b; text-transform: uppercase; font-weight: 700;">Student ID</div>
                        <div style="font-size: 0.85rem; font-weight: 700; color: #0f172a; margin-top: 2px; font-family: 'Courier New', monospace;">${studentId}</div>
                    </div>
                    <div style="flex: 1; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 0.6rem 0.85rem;">
                        <div style="font-size: 0.6rem; color: #64748b; text-transform: uppercase; font-weight: 700;">Year Level</div>
                        <div style="font-size: 0.85rem; font-weight: 700; color: #0f172a; margin-top: 2px;">${yearLevel}</div>
                    </div>
                    <div style="flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 0.6rem 0.85rem;">
                        <div style="font-size: 0.6rem; color: #15803d; text-transform: uppercase; font-weight: 700;">Status</div>
                        <div style="font-size: 0.85rem; font-weight: 800; color: #15803d; margin-top: 2px;">✓ ENROLLED</div>
                    </div>
                </div>
                <div style="font-size: 0.95rem; color: #1e293b; line-height: 1.8; text-align: justify;">
                    <p>This is to certify that <strong>${studentName}</strong> is officially enrolled in the <strong>${program}</strong> program for the <strong>${semester}</strong> of Academic Year <strong>${academicYear}</strong>.</p>
                    <p>This certification is issued upon the request of the student for whatever legal purpose it may serve.</p>
                    <p style="margin-top: 1.5rem;">Issued this <strong>${formatDate(state.studentDate)}</strong>.</p>
                </div>
            </div>
            <div style="margin-top: 2.5rem; text-align: right;">
                <div style="display: inline-block; text-align: center; min-width: 250px;">
                    ${sigHtml}
                    <div style="border-top: 2px solid #0f172a; margin-top: 0.4rem; padding-top: 0.3rem;"></div>
                    <div style="font-weight: 800; text-transform: uppercase; font-size: 0.95rem; letter-spacing: 1px;">${sigNameHtml}</div>
                    <div style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">University Registrar</div>
                </div>
            </div>`;
    }

    // Classic fallback
    return `
        <div class="letter-body" style="font-size: 1rem; color: #1e293b; margin-top: 1rem; line-height: 1.8;">
            <p>This is to certify that <strong>${studentName}</strong>,
            is officially enrolled in the <strong>${program}</strong> program 
            for the <strong>${semester}</strong> of Academic Year <strong>${academicYear}</strong>.</p>
            
            <p>This certification is issued upon the request of the student for whatever legal purpose it may serve.</p>
            <p style="margin-top: 2rem;">Issued this <strong>${formatDate(state.studentDate)}</strong>.</p>
        </div>
        <div class="signature-wrapper" style="text-align: right; margin-top: 3rem;">
            <div class="signature-block" style="display: inline-block; text-align: center; min-width: 280px;">
                ${sigHtml}
                <div class="sig-line" style="margin-top: 0; width: 100%; border-color: #1e293b;"></div>
                <div class="sig-name" style="font-weight: 800; text-transform: uppercase; font-size: 0.95rem; letter-spacing: 1px;">${sigNameHtml}</div>
                <div class="sig-title" style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">University Registrar</div>
            </div>
        </div>`;
}

function renderStudentIDBody() {
    const idLogoHtml = (state.customLogo || state.studentLogo)
        ? `<img src="${(state.customLogo || state.studentLogo)}" alt="School Logo" class="id-logo">`
        : `<div class="id-logo-placeholder">Logo</div>`;

    const watermarkHtml = (state.customLogo || state.studentLogo)
        ? `<img src="${(state.customLogo || state.studentLogo)}" alt="Watermark" class="doc-watermark">`
        : '';

    const photoHtml = state.studentPhoto
        ? `<img src="${state.studentPhoto}" alt="Student Photo" class="id-photo-img">`
        : `<div class="id-photo-placeholder">Photo</div>`;
        
    let sigHtml = '';
    if (state.studentSignature) {
        sigHtml = `<img src="${state.studentSignature}" alt="Signature" class="sig-image" style="max-height: 30px;">`;
    } else if (state.studentAutoSig && state.studentFname) {
        sigHtml = `<div class="auto-signature" style="font-size: 1.5rem;">${escapeHtml(state.studentFname)}</div>`;
    }
        
    if (state.studentTemplate === 'modern') {
        // ── MODERN: Sleek gradient header, rectangular photo, clean info grid ──
        return `
            <div class="id-wrapper" style="border: none; overflow: hidden; padding: 0; background: #ffffff; display: flex; flex-direction: column; height: 100%; box-sizing: border-box; font-family: 'Inter', sans-serif;">
                ${watermarkHtml}
                <!-- Header: gradient band with logo + school name -->
                <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #3b82f6 100%); color: white; padding: 1rem 1.1rem; display: flex; align-items: center; gap: 0.65rem; flex-shrink: 0;">
                    ${(state.customLogo || state.studentLogo) ? `<img src="${(state.customLogo || state.studentLogo)}" alt="Logo" style="height: 44px; width: 44px; object-fit: contain; background: white; border-radius: 50%; padding: 3px; flex-shrink: 0;">` : `<div style="width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.5rem; font-weight: 700; flex-shrink: 0;">LOGO</div>`}
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 800; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.2;">${escapeHtml(state.studentSchool || 'University Name')}</div>
                        <div style="font-size: 0.5rem; opacity: 0.85; margin-top: 2px; line-height: 1.2;">${escapeHtml(state.studentAddress || 'School Address')}</div>
                    </div>
                </div>
                <!-- ID Type Banner -->
                <div style="background: #f59e0b; color: #78350f; text-align: center; font-size: 0.6rem; font-weight: 800; letter-spacing: 2.5px; padding: 0.3rem 0; text-transform: uppercase;">Student Identification Card</div>

                <!-- Body: Photo + Info side by side -->
                <div style="padding: 1rem 1.1rem; display: flex; gap: 0.85rem; flex: 1;">
                    <!-- Photo + Signature column -->
                    <div style="width: 105px; flex-shrink: 0; display: flex; flex-direction: column;">
                        <div style="width: 105px; height: 135px; border: 2.5px solid #1e3a5f; overflow: hidden; background: #e2e8f0;">
                            ${state.studentPhoto ? `<img src="${state.studentPhoto}" alt="Student" style="width: 100%; height: 100%; object-fit: cover;">` : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:0.75rem;">2x2<br>Photo</div>`}
                        </div>
                        <!-- Signature under photo -->
                        <div style="margin-top: auto; text-align: center; padding-top: 0.75rem;">
                            <div style="height: 28px; display: flex; align-items: flex-end; justify-content: center;">${sigHtml}</div>
                            <div style="border-top: 1.5px solid #1e3a5f; margin-top: 3px; padding-top: 3px; font-size: 0.45rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Student's Signature</div>
                        </div>
                    </div>
                    <!-- Info Fields -->
                    <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; min-width: 0;">
                        <div style="display: flex; flex-direction: column; gap: 0.55rem;">
                            <div>
                                <div style="font-size: 0.5rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Name</div>
                                <div style="font-size: 1.05rem; font-weight: 900; color: #0f172a; line-height: 1.15; text-transform: uppercase; border-bottom: 1.5px solid #1e3a5f; padding-bottom: 4px;">${escapeHtml(state.studentLname || 'DELA CRUZ')}, ${escapeHtml(state.studentFname || 'JUAN')}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.5rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Student No.</div>
                                <div style="font-size: 0.95rem; font-weight: 800; color: #1e293b; font-family: 'Courier New', monospace; letter-spacing: 1px;">${escapeHtml(state.studentId || 'STU-2025-04821')}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.5rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Program</div>
                                <div style="font-size: 0.78rem; font-weight: 700; color: #1e293b; line-height: 1.25;">${escapeHtml(state.studentProgram || 'Bachelor of Science in Computer Science')}</div>
                            </div>
                            <div style="display: flex; gap: 0.75rem;">
                                <div style="flex: 1;">
                                    <div style="font-size: 0.5rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Year Level</div>
                                    <div style="font-size: 0.78rem; font-weight: 700; color: #1e293b;">${escapeHtml(state.studentYearLevel || '3rd Year')}</div>
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-size: 0.5rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">S.Y.</div>
                                    <div style="font-size: 0.78rem; font-weight: 700; color: #1e293b;">${escapeHtml(state.studentAcademicYear || '2025-2026')}</div>
                                </div>
                            </div>
                            <div>
                                <div style="font-size: 0.5rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Semester</div>
                                <div style="font-size: 0.78rem; font-weight: 700; color: #1e293b;">${escapeHtml(state.studentSemester || '1st Semester')}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer: Validity + Barcode -->
                <div style="flex-shrink: 0;">
                    <div style="background: #f1f5f9; border-top: 1px solid #e2e8f0; padding: 0.45rem 1.1rem; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-size: 0.45rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Valid Until</div>
                            <div style="font-size: 0.8rem; font-weight: 800; color: #1e293b;">${state.studentValidUntil ? formatDate(state.studentValidUntil) : 'August 23, 2026'}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 0.45rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Registrar</div>
                            <div style="font-size: 0.7rem; font-weight: 700; color: #1e293b;">${escapeHtml(state.studentRepName || 'University Registrar')}</div>
                        </div>
                    </div>
                    <div style="padding: 0.35rem 1.1rem 0.65rem 1.1rem; display: flex; justify-content: center; background: #fff;">
                        <div class="id-barcode" style="font-size: 2.8rem; line-height: 0.8;">*${escapeHtml(state.studentId || 'STU-2025-04821')}*</div>
                    </div>
                </div>
            </div>
        `;
    } else if (state.studentTemplate === 'minimalist') {
        // ── MINIMALIST: Clean Swiss-style typography, rectangular photo, mono-spaced ID ──
        return `
            <div class="id-wrapper" style="border: 1px solid #d1d5db; padding: 0; background: #ffffff; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; height: 100%; box-sizing: border-box; overflow: hidden;">
                ${watermarkHtml}
                <!-- Thin top accent line -->
                <div style="height: 5px; background: linear-gradient(90deg, #111827 0%, #6b7280 100%); flex-shrink: 0;"></div>

                <!-- Header -->
                <div style="padding: 0.85rem 1.1rem 0.7rem 1.1rem; display: flex; align-items: center; gap: 0.65rem; border-bottom: 1px solid #e5e7eb; flex-shrink: 0;">
                    ${(state.customLogo || state.studentLogo) ? `<img src="${(state.customLogo || state.studentLogo)}" alt="Logo" style="height: 36px; width: 36px; object-fit: contain; flex-shrink: 0;">` : ''}
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 0.88rem; font-weight: 700; color: #111827; letter-spacing: 0.3px; line-height: 1.2;">${escapeHtml(state.studentSchool || 'University Name')}</div>
                        <div style="font-size: 0.48rem; color: #9ca3af; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px;">Student Identification</div>
                    </div>
                </div>

                <!-- Body -->
                <div style="flex: 1; padding: 0.85rem 1.1rem; display: flex; flex-direction: column; justify-content: space-between;">
                    <!-- Photo + Name row -->
                    <div style="display: flex; gap: 0.85rem;">
                        <div style="width: 95px; height: 125px; border: 1px solid #d1d5db; background: #f9fafb; flex-shrink: 0; overflow: hidden;">
                            ${state.studentPhoto ? `<img src="${state.studentPhoto}" alt="Student" style="width: 100%; height: 100%; object-fit: cover;">` : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#d1d5db; font-size:0.7rem;">Photo</div>`}
                        </div>
                        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; min-width: 0;">
                            <div style="font-size: 1.25rem; font-weight: 800; color: #111827; line-height: 1.1; text-transform: uppercase; letter-spacing: -0.3px;">${escapeHtml(state.studentLname || 'Dela Cruz')}</div>
                            <div style="font-size: 0.95rem; font-weight: 400; color: #374151; margin-top: 2px;">${escapeHtml(state.studentFname || 'Juan')}</div>
                            <div style="margin-top: 0.65rem; font-size: 0.7rem; color: #6b7280; line-height: 1.3;">${escapeHtml(state.studentProgram || 'Bachelor of Science in Computer Science')}</div>
                            <div style="font-size: 0.62rem; color: #9ca3af; margin-top: 3px;">${escapeHtml(state.studentYearLevel || '3rd Year')} · ${escapeHtml(state.studentSemester || '1st Semester')}</div>
                        </div>
                    </div>

                    <!-- Info fields -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem 1.5rem; border-top: 1px solid #f3f4f6; padding-top: 0.7rem; margin-top: 0.85rem;">
                        <div>
                            <div style="font-size: 0.48rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Student No.</div>
                            <div style="font-size: 0.85rem; font-weight: 700; color: #111827; font-family: 'Courier New', monospace; letter-spacing: 0.5px; margin-top: 2px;">${escapeHtml(state.studentId || 'STU-2025-04821')}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.48rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Academic Year</div>
                            <div style="font-size: 0.85rem; font-weight: 700; color: #111827; margin-top: 2px;">${escapeHtml(state.studentAcademicYear || '2025-2026')}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.48rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Valid Until</div>
                            <div style="font-size: 0.85rem; font-weight: 700; color: #111827; margin-top: 2px;">${state.studentValidUntil ? formatDate(state.studentValidUntil) : 'August 23, 2026'}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.48rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Registrar</div>
                            <div style="font-size: 0.68rem; font-weight: 600; color: #111827; margin-top: 2px;">${escapeHtml(state.studentRepName || 'Registrar')}</div>
                        </div>
                    </div>

                    <!-- Signature area -->
                    <div style="padding-top: 0.85rem; display: flex; justify-content: center; align-items: flex-end;">
                        <div style="text-align: center; width: 140px;">
                            <div style="height: 28px; display: flex; align-items: flex-end; justify-content: center;">${sigHtml}</div>
                            <div style="border-top: 1px solid #d1d5db; margin-top: 3px; padding-top: 3px; font-size: 0.45rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Student Signature</div>
                        </div>
                    </div>
                </div>

                <!-- Barcode footer -->
                <div style="border-top: 1px solid #e5e7eb; padding: 0.4rem 1.1rem 0.6rem 1.1rem; display: flex; justify-content: center; background: #fafafa; flex-shrink: 0;">
                    <div class="id-barcode" style="font-size: 2.5rem; line-height: 0.8; color: #1f2937;">*${escapeHtml(state.studentId || 'STU-2025-04821')}*</div>
                </div>
            </div>
        `;
    } else if (state.studentTemplate === 'corporate') {
        // ── CORPORATE: Bold navy/crimson institutional card, structured form layout ──
        return `
            <div class="id-wrapper" style="border: none; padding: 0; display: flex; flex-direction: column; background: white; font-family: 'Inter', 'Arial', sans-serif; height: 100%; box-sizing: border-box; overflow: hidden;">
                ${watermarkHtml}
                <!-- Header: Dark navy with logo and school info -->
                <div style="background: #0f172a; color: white; padding: 0.75rem 1rem; display: flex; align-items: center; gap: 0.65rem; flex-shrink: 0;">
                    ${(state.customLogo || state.studentLogo) ? `<img src="${(state.customLogo || state.studentLogo)}" alt="Logo" style="height: 44px; width: 44px; object-fit: contain; background: white; border-radius: 4px; padding: 3px; flex-shrink: 0;">` : `<div style="width: 44px; height: 44px; background: #1e293b; border: 1px solid #334155; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.5rem; font-weight: 700; flex-shrink: 0;">LOGO</div>`}
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 900; font-size: 0.88rem; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.2;">${escapeHtml(state.studentSchool || 'University Name')}</div>
                        <div style="font-size: 0.45rem; color: #94a3b8; line-height: 1.2; margin-top: 2px;">${escapeHtml(state.studentAddress || 'School Address')}</div>
                    </div>
                </div>
                <!-- Crimson accent band -->
                <div style="background: #b91c1c; color: white; text-align: center; font-size: 0.6rem; font-weight: 800; letter-spacing: 2.5px; padding: 0.28rem 0; text-transform: uppercase;">Student Identification Card</div>

                <!-- Body -->
                <div style="flex: 1; padding: 0.85rem 1rem 0.5rem 1rem; display: flex; flex-direction: column; justify-content: space-between;">
                    <!-- Photo + Info -->
                    <div style="display: flex; gap: 0.85rem;">
                        <!-- Photo with border -->
                        <div style="flex-shrink: 0;">
                            <div style="width: 100px; height: 130px; border: 2.5px solid #0f172a; overflow: hidden; background: #f1f5f9;">
                                ${state.studentPhoto ? `<img src="${state.studentPhoto}" alt="Student" style="width: 100%; height: 100%; object-fit: cover;">` : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:0.7rem; font-weight: 600;">2×2<br>Photo</div>`}
                            </div>
                        </div>
                        <!-- Info block -->
                        <div style="flex: 1; display: flex; flex-direction: column; gap: 0.4rem; min-width: 0;">
                            <!-- Name -->
                            <div style="background: #f8fafc; border-left: 3px solid #b91c1c; padding: 0.35rem 0.55rem;">
                                <div style="font-size: 0.45rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Full Name</div>
                                <div style="font-size: 1rem; font-weight: 900; color: #0f172a; text-transform: uppercase; line-height: 1.15;">${escapeHtml(state.studentLname || 'DELA CRUZ')}, ${escapeHtml(state.studentFname || 'JUAN')}</div>
                            </div>
                            <!-- Student No -->
                            <div style="padding: 0 0.55rem;">
                                <div style="font-size: 0.45rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Student No.</div>
                                <div style="font-size: 0.9rem; font-weight: 800; color: #0f172a; font-family: 'Courier New', monospace; letter-spacing: 1.5px;">${escapeHtml(state.studentId || 'STU-2025-04821')}</div>
                            </div>
                            <!-- Program -->
                            <div style="padding: 0 0.55rem;">
                                <div style="font-size: 0.45rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Program / Course</div>
                                <div style="font-size: 0.72rem; font-weight: 700; color: #1e293b; line-height: 1.25;">${escapeHtml(state.studentProgram || 'Bachelor of Science in Computer Science')}</div>
                            </div>
                            <!-- Year + SY row -->
                            <div style="display: flex; gap: 0.5rem; padding: 0 0.55rem;">
                                <div style="flex: 1;">
                                    <div style="font-size: 0.45rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Year</div>
                                    <div style="font-size: 0.72rem; font-weight: 700; color: #1e293b;">${escapeHtml(state.studentYearLevel || '3rd Year')}</div>
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-size: 0.45rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">S.Y.</div>
                                    <div style="font-size: 0.72rem; font-weight: 700; color: #1e293b;">${escapeHtml(state.studentAcademicYear || '2025-2026')}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Signatures row -->
                    <div style="display: flex; justify-content: center; align-items: flex-end; padding-top: 0.65rem;">
                        <div style="text-align: center; width: 100px;">
                            <div style="height: 28px; display: flex; align-items: flex-end; justify-content: center;">${sigHtml}</div>
                            <div style="border-top: 1.5px solid #0f172a; margin-top: 3px; padding-top: 3px; font-size: 0.45rem; color: #475569; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Student's Signature</div>
                        </div>
                    </div>
                </div>

                <!-- Footer: Validity + Barcode -->
                <div style="flex-shrink: 0;">
                    <div style="background: #0f172a; padding: 0.4rem 1rem; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-size: 0.45rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Valid Until</div>
                            <div style="font-size: 0.78rem; font-weight: 800; color: #ffffff;">${state.studentValidUntil ? formatDate(state.studentValidUntil) : 'August 23, 2026'}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 0.45rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Semester</div>
                            <div style="font-size: 0.78rem; font-weight: 800; color: #ffffff;">${escapeHtml(state.studentSemester || '1st Semester')}</div>
                        </div>
                    </div>
                    <div style="padding: 0.35rem 1rem 0.65rem 1rem; display: flex; justify-content: center; background: #ffffff;">
                        <div class="id-barcode" style="font-size: 2.8rem; line-height: 0.8;">*${escapeHtml(state.studentId || 'STU-2025-04821')}*</div>
                    </div>
                </div>
            </div>
        `;
    }

    return `
        <div class="id-wrapper">
            ${watermarkHtml}
            
            <div class="id-header">
                ${idLogoHtml}
                <div class="id-header-text">
                    <div class="id-school-name">${escapeHtml(state.studentSchool || 'MAPÚA MCL SENIOR HIGH SCHOOL').toUpperCase()}</div>
                    <div class="id-address">${escapeHtml(state.studentAddress || '658 Muralla St, Intramuros, 1002 Metro Manila')}</div>
                </div>
            </div>
            
            <div class="id-type-banner" style="background: #15803d; color: white;">STUDENT IDENTIFICATION CARD</div>
            
            <div class="id-body-content">
                <div class="id-photo-container">
                    ${photoHtml}
                </div>
                
                <div class="id-info-center">
                    <div class="id-name">${escapeHtml(state.studentFname || 'JUAN')} ${escapeHtml(state.studentLname || 'DELA CRUZ')}</div>
                    <div class="id-position">${escapeHtml(state.studentProgram || 'BS COMPUTER SCIENCE').toUpperCase()}</div>
                    
                    <div class="id-details-grid">
                        <div class="id-detail-row">
                            <span class="id-detail-label">ID NO:</span>
                            <span class="id-detail-value">${escapeHtml(state.studentId || 'STD-2026-001')}</span>
                        </div>
                        <div class="id-detail-row">
                            <span class="id-detail-label">VALID UNTIL:</span>
                            <span class="id-detail-value">${state.studentValidUntil ? formatDate(state.studentValidUntil).toUpperCase() : 'AUGUST 23, 2026'}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="id-footer">
                <div class="id-signature-box">
                    <div class="id-sig-img-container">${sigHtml}</div>
                    <div class="id-sig-line"></div>
                    <div class="id-sig-label">Student's Signature</div>
                </div>
                <div class="id-seal-box" style="color: #15803d; border-color: #15803d;">
                    <div class="id-seal-stamp">VERIFIED</div>
                </div>
            </div>
            
            <div class="id-barcode-container">
                <div class="id-barcode">*${escapeHtml(state.studentId || 'STD-2026-001')}*</div>
            </div>
        </div>
    `;
}

function renderTeacherPreview() {
    const type = state.teacherDocType || 'coe';
    
    // Set up common UI elements (logo, signatures, watermark)
    const logoHtml = (state.customLogo || state.teacherLogo)
        ? `<img src="${(state.customLogo || state.teacherLogo)}" alt="School Logo" class="doc-logo">`
        : `<div class="doc-logo" style="width:80px;height:80px;border:2px dashed #ccc;display:flex;align-items:center;justify-content:center;font-size:0.7rem;color:#aaa;border-radius:8px;">Logo</div>`;

    let sigHtml = '';
    if (state.teacherSignature) {
        sigHtml = `<img src="${state.teacherSignature}" alt="Signature" class="sig-image">`;
    } else if (state.teacherAutoSig && state.teacherRepName) {
        sigHtml = `<div class="auto-signature">${escapeHtml(getLastName(state.teacherRepName))}</div>`;
    }

    const watermarkHtml = (state.customLogo || state.teacherLogo)
        ? `<img src="${(state.customLogo || state.teacherLogo)}" alt="Watermark" class="doc-watermark">`
        : '';

    const sigNameHtml = state.teacherRepName ? `<div class="sig-name">${escapeHtml(state.teacherRepName)}</div>` : '';

    let bodyHtml = '';
    let docTitle = '';

    if (type === 'coe') {
        docTitle = 'Certificate of Employment';
        bodyHtml = renderTeacherCOEBody(sigHtml, sigNameHtml);
    } else if (type === 'payslip') {
        docTitle = 'Official Payslip';
        bodyHtml = renderPayslipBody(sigHtml, sigNameHtml);
    } else if (type === 'license') {
        // License uses a radically different layout, so it returns early
        renderContent.innerHTML = renderLicenseBody(sigHtml, sigNameHtml, watermarkHtml);
        return;
    } else if (type === 'idcard') {
        // ID card also uses a specialized portrait layout
        renderContent.innerHTML = renderTeacherIDBody(sigHtml, watermarkHtml);
        return;
    }

    // Default Letter Layout (used by COE and Payslip)
    if (state.teacherTemplate === 'modern') {
        renderContent.innerHTML = `
            ${watermarkHtml}
            <div class="doc-header-modern" style="background-color: #1e293b; color: white; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-radius: 8px 8px 0 0; margin-bottom: 2rem;">
                <div style="background: white; padding: 8px; border-radius: 4px;">
                    ${(state.customLogo || state.teacherLogo) ? `<img src="${(state.customLogo || state.teacherLogo)}" alt="School Logo" style="height: 60px; object-fit: contain;">` : `<div style="color:#1e293b; font-weight:bold; height:60px; display:flex; align-items:center;">LOGO</div>`}
                </div>
                <div class="doc-school-info-modern" style="text-align: right;">
                    <div class="doc-school-name" style="font-size: 1.5rem; font-weight: 800; text-transform: uppercase;">${escapeHtml(state.teacherSchool || 'School Name')}</div>
                    <div class="doc-school-details" style="color: rgba(255,255,255,0.8); margin-top: 4px;">${escapeHtml(state.teacherAddress || '')}</div>
                    <div class="doc-school-details" style="color: rgba(255,255,255,0.8); margin-top: 2px;">${escapeHtml(state.teacherEmail || '')} ${state.teacherPhone ? '| ' + escapeHtml(state.teacherPhone) : ''}</div>
                </div>
            </div>
            <div class="doc-title-modern" style="border-left: 5px solid #1e293b; padding-left: 1rem; margin-bottom: 1.5rem; font-size: 1.4rem; font-weight: 800; text-transform: uppercase; color: #1e293b;">
                ${docTitle}
            </div>
            ${bodyHtml}
            
            <div style="margin-top: 3rem; text-align: right; color: #94a3b8; font-size: 0.75rem;">
                PRINTED: ${new Date().toLocaleDateString()}
            </div>
        `;
    } else if (state.teacherTemplate === 'minimalist') {
        renderContent.innerHTML = `
            ${watermarkHtml}
            <div style="font-family: 'Inter', sans-serif; color: #333; max-width: 800px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 3rem;">
                    ${(state.customLogo || state.teacherLogo) ? `<img src="${(state.customLogo || state.teacherLogo)}" alt="School Logo" style="height: 60px; object-fit: contain; margin-bottom: 1.5rem;">` : ''}
                    <div style="font-size: 1.4rem; letter-spacing: 3px; text-transform: uppercase;">${escapeHtml(state.teacherSchool || 'School Name')}</div>
                    <div style="font-size: 0.85rem; color: #888; margin-top: 0.5rem; letter-spacing: 1px;">${escapeHtml(state.teacherAddress || '')}</div>
                    <div style="font-size: 0.85rem; color: #888; margin-top: 0.25rem; letter-spacing: 1px;">${escapeHtml(state.teacherEmail || '')} ${state.teacherPhone ? '| ' + escapeHtml(state.teacherPhone) : ''}</div>
                </div>
                
                <div style="text-align: center; font-size: 1.6rem; font-weight: 300; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 3rem; border-bottom: 1px solid #eaeaea; padding-bottom: 1.5rem;">
                    ${docTitle}
                </div>
                
                ${bodyHtml}
                
                <div style="margin-top: 5rem; text-align: center; border-top: 1px solid #eaeaea; padding-top: 1rem; color: #bbb; font-size: 0.75rem; letter-spacing: 2px; text-transform: uppercase;">
                    Document Generated &middot; ${new Date().toLocaleDateString()}
                </div>
            </div>
        `;
    } else if (state.teacherTemplate === 'corporate') {
        renderContent.innerHTML = `
            ${watermarkHtml}
            <div style="font-family: 'Arial', sans-serif; color: #1a202c;">
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 4px solid #1e3a8a; padding-bottom: 1.5rem; margin-bottom: 2.5rem;">
                    <div style="display: flex; align-items: center; gap: 1.5rem;">
                        ${(state.customLogo || state.teacherLogo) ? `<img src="${(state.customLogo || state.teacherLogo)}" alt="School Logo" style="height: 75px; object-fit: contain;">` : `<div style="width: 75px; height: 75px; background: #1e3a8a; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: bold;">LOGO</div>`}
                        <div>
                            <div style="font-size: 1.6rem; font-weight: 900; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px;">${escapeHtml(state.teacherSchool || 'School Name')}</div>
                            <div style="font-size: 0.95rem; color: #475569; margin-top: 6px; font-weight: 600;">Human Resources Department</div>
                        </div>
                    </div>
                    <div style="text-align: right; border-left: 2px solid #cbd5e1; padding-left: 1.5rem;">
                        <div style="font-size: 0.85rem; color: #64748b; font-weight: bold;">${escapeHtml(state.teacherAddress || '')}</div>
                        <div style="font-size: 0.85rem; color: #64748b; margin-top: 4px;">${escapeHtml(state.teacherEmail || '')}</div>
                        ${state.teacherPhone ? `<div style="font-size: 0.85rem; color: #64748b; margin-top: 4px;">${escapeHtml(state.teacherPhone)}</div>` : ''}
                    </div>
                </div>
                
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #1e3a8a; padding: 1.5rem; margin-bottom: 2.5rem;">
                    <div style="font-size: 1.3rem; font-weight: 900; color: #1e293b; text-transform: uppercase; letter-spacing: 1.5px;">${docTitle}</div>
                    <div style="font-size: 0.85rem; color: #64748b; margin-top: 8px; font-weight: 600;">DATE ISSUED: ${new Date().toLocaleDateString()}</div>
                </div>
                
                ${bodyHtml}
                
                <div style="margin-top: 4rem; border-top: 2px solid #1e3a8a; padding-top: 1rem; display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; font-weight: bold;">
                    <div>OFFICIAL RECORD</div>
                    <div>CONFIDENTIAL</div>
                </div>
            </div>
        `;
    } else {
        renderContent.innerHTML = `
            ${watermarkHtml}
            <div class="doc-header">
                ${logoHtml}
                <div class="doc-school-info">
                    <div class="doc-school-name">${escapeHtml(state.teacherSchool || 'School Name')}</div>
                    <div class="doc-school-details">${escapeHtml(state.teacherAddress || '')}</div>
                    <div class="doc-school-details">${escapeHtml(state.teacherEmail || '')} ${state.teacherPhone ? '| ' + escapeHtml(state.teacherPhone) : ''}</div>
                </div>
            </div>
            <div class="doc-title">${docTitle}</div>
            ${bodyHtml}
        `;
    }
}

function renderTeacherCOEBody(sigHtml, sigNameHtml) {
    const pronoun = state.teacherPronoun || 'He/Him';
    let subjective = 'he', objective = 'him', possessive = 'his';
    if (pronoun === 'She/Her') { subjective = 'she'; objective = 'her'; possessive = 'her'; }
    else if (pronoun === 'They/Them') { subjective = 'they'; objective = 'them'; possessive = 'their'; }

    const respLines = (state.teacherResponsibilities || '').split('\n').filter(l => l.trim());
    let respHtml = '';
    if (respLines.length > 0) {
        respHtml = `<p>${subjective.charAt(0).toUpperCase() + subjective.slice(1)} is responsible for the following:</p>
        <ul class="responsibilities-list">
            ${respLines.map(r => `<li>${escapeHtml(r.trim())}</li>`).join('')}
        </ul>`;
    }

    const fullName = escapeHtml(state.teacherFullname || '—');
    const schoolName = escapeHtml(state.teacherSchool || '—');
    const title = escapeHtml(state.teacherTitle || '—');
    const empType = escapeHtml(state.teacherType || 'Full-Time');
    const certNo = escapeHtml(state.teacherCertNo || '—');
    const startDate = formatDate(state.teacherStartdate);
    const issueDate = formatDate(state.teacherIssuedate);
    const template = state.teacherTemplate;

    const letterBody = `
        <div style="font-size: 0.95rem; color: #334155; line-height: 1.8; text-align: justify;">
            <p>To Whom It May Concern,</p>
            <p>This is to certify that <strong style="color: #0f172a;">${fullName}</strong> is currently employed at
            <strong>${schoolName}</strong> as a <strong>${title}</strong>.</p>
            <p>${subjective.charAt(0).toUpperCase() + subjective.slice(1)} has been working on a <strong>${empType}</strong> basis since <strong>${startDate}</strong> and is actively teaching for the current Academic Year 2025-2026.</p>
            ${respHtml}
            <p>This certificate is issued upon ${possessive} request for whatever legal purpose it may serve.</p>
        </div>`;

    if (template === 'modern') {
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
                <div style="font-size: 0.7rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Employee Information</div>
                <div style="font-size: 0.7rem; color: #64748b;">Certificate No: <strong style="color: #0f172a; font-family: 'Courier New', monospace;">${certNo}</strong></div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem;">
                <div style="background: #f8fafc; border-left: 3px solid #1e293b; padding: 0.6rem 0.85rem;">
                    <div style="font-size: 0.6rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Position</div>
                    <div style="font-size: 0.85rem; font-weight: 700; color: #0f172a; margin-top: 2px;">${title}</div>
                </div>
                <div style="background: #f8fafc; border-left: 3px solid #1e293b; padding: 0.6rem 0.85rem;">
                    <div style="font-size: 0.6rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Employment Type</div>
                    <div style="font-size: 0.85rem; font-weight: 700; color: #0f172a; margin-top: 2px;">${empType}</div>
                </div>
                <div style="background: #f8fafc; border-left: 3px solid #1e293b; padding: 0.6rem 0.85rem;">
                    <div style="font-size: 0.6rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Date Started</div>
                    <div style="font-size: 0.85rem; font-weight: 700; color: #0f172a; margin-top: 2px;">${startDate}</div>
                </div>
            </div>
            ${letterBody}
            <div style="margin-top: 2.5rem; text-align: right;">
                <div style="display: inline-block; text-align: center; min-width: 250px;">
                    ${sigHtml}
                    <div style="border-top: 2px solid #1e293b; margin-top: 0.4rem; padding-top: 0.3rem;"></div>
                    ${sigNameHtml}
                    <div style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">School Principal / Authorized Representative</div>
                </div>
            </div>`;
    } else if (template === 'minimalist') {
        return `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb;">
                <div>
                    <div style="font-size: 0.6rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Certificate No.</div>
                    <div style="font-size: 0.95rem; font-weight: 600; color: #111; margin-top: 3px; font-family: 'Courier New', monospace;">${certNo}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.6rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Date Issued</div>
                    <div style="font-size: 0.95rem; font-weight: 600; color: #111; margin-top: 3px;">${issueDate}</div>
                </div>
            </div>
            <div style="font-size: 0.95rem; color: #374151; line-height: 1.85;">
                <p style="margin-bottom: 1rem;">To Whom It May Concern,</p>
                <p>This is to certify that <strong style="color: #111;">${fullName}</strong> is currently employed at
                <strong>${schoolName}</strong> as a <strong>${title}</strong> on a <strong>${empType}</strong> basis.</p>
                <p>${subjective.charAt(0).toUpperCase() + subjective.slice(1)} has been with the institution since <strong>${startDate}</strong> and is actively teaching for the current Academic Year 2025-2026.</p>
                ${respHtml}
                <p>This certificate is issued upon ${possessive} request for whatever legal purpose it may serve.</p>
            </div>
            <div style="margin-top: 2.5rem; display: flex; justify-content: flex-end;">
                <div style="text-align: center; min-width: 220px;">
                    ${sigHtml}
                    <div style="border-top: 1px solid #1a1a1a; margin-top: 0.4rem; padding-top: 0.3rem;"></div>
                    ${sigNameHtml}
                    <div style="font-size: 0.7rem; color: #9ca3af;">School Principal / Authorized Representative</div>
                </div>
            </div>`;
    } else if (template === 'corporate') {
        return `
            <div style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 0.75rem 1rem; margin-bottom: 1.25rem;">
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 0.75rem; margin-bottom: 0.6rem; padding-bottom: 0.6rem; border-bottom: 1px solid #e2e8f0;">
                    <div>
                        <div style="font-size: 0.55rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Certificate No.</div>
                        <div style="font-size: 0.85rem; font-weight: 700; color: #0f172a; margin-top: 2px; font-family: 'Courier New', monospace;">${certNo}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.55rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Position / Designation</div>
                        <div style="font-size: 0.85rem; font-weight: 700; color: #0f172a; margin-top: 2px;">${title}</div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; align-items: center;">
                    <div>
                        <div style="font-size: 0.55rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Employment Type</div>
                        <div style="font-size: 0.85rem; font-weight: 700; color: #0f172a; margin-top: 2px;">${empType}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.55rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Date Started</div>
                        <div style="font-size: 0.85rem; font-weight: 700; color: #0f172a; margin-top: 2px;">${startDate}</div>
                    </div>
                    <div style="text-align: right;">
                        <span style="background: #dcfce7; color: #15803d; font-size: 0.7rem; font-weight: 800; padding: 0.25rem 0.75rem; border-radius: 3px; letter-spacing: 0.5px;">✓ ACTIVE</span>
                    </div>
                </div>
            </div>
            <div style="font-size: 0.9rem; color: #334155; line-height: 1.65; text-align: justify;">
                <p>To Whom It May Concern,</p>
                <p>This is to certify that <strong style="color: #0f172a;">${fullName}</strong> is currently employed at
                <strong>${schoolName}</strong> as a <strong>${title}</strong>.</p>
                <p>${subjective.charAt(0).toUpperCase() + subjective.slice(1)} has been working on a <strong>${empType}</strong> basis since <strong>${startDate}</strong> and is actively teaching for the current Academic Year 2025-2026.</p>
                ${respHtml}
                <p>This certificate is issued upon ${possessive} request for whatever legal purpose it may serve.</p>
            </div>
            <div style="margin-top: 1.5rem; text-align: right;">
                <div style="display: inline-block; text-align: center; min-width: 250px;">
                    ${sigHtml}
                    <div style="border-top: 2px solid #0f172a; margin-top: 0.4rem; padding-top: 0.3rem;"></div>
                    ${sigNameHtml}
                    <div style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">School Principal / Authorized Representative</div>
                </div>
            </div>`;
    }

    // Classic fallback
    return `
        <div class="doc-date-right">
            <div>Certificate No. ${certNo}</div>
            <div style="margin-top:0.5rem;">${issueDate}</div>
        </div>
        <div class="letter-body">
            <p>To Whom It May Concern,</p>
            <p>This is to certify that <strong>${fullName}</strong> is currently employed at
            <strong>${schoolName}</strong> as a <strong>${title}</strong>.</p>
            <p>${subjective.charAt(0).toUpperCase() + subjective.slice(1)} has been working on a <strong>${empType}</strong> basis since <strong>${startDate}</strong> and is actively teaching for the current Academic Year 2025-2026.</p>
            ${respHtml}
            <p>This certificate is issued upon ${possessive} request for whatever legal purpose it may serve.</p>
        </div>
        <div class="signature-wrapper">
            <div class="signature-block">
                ${sigHtml}
                <div class="sig-line"></div>
                ${sigNameHtml}
                <div class="sig-title">School Principal / Authorized Representative</div>
            </div>
        </div>`;
}

function renderPayslipBody(sigHtml, sigNameHtml) {
    const basic = parseFloat(state.teacherBasicSalary) || 0;
    const allow = parseFloat(state.teacherAllowances) || 0;
    const gross = basic + allow;

    const tax = parseFloat(state.teacherTax) || 0;
    const sss = parseFloat(state.teacherSSS) || 0;
    const ph = parseFloat(state.teacherPhilhealth) || 0;
    const pagibig = parseFloat(state.teacherPagibig) || 0;
    const totalDeductions = tax + sss + ph + pagibig;

    const netPay = gross - totalDeductions;
    const fmt = (num) => formatCurrency(num);
    const fullName = escapeHtml(state.teacherFullname || '—');
    const payPeriod = escapeHtml(state.teacherPayPeriod || '—');
    const issueDate = formatDate(state.teacherIssuedate);
    const template = state.teacherTemplate;

    if (template === 'modern') {
        return `
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem;">
                <div style="background: #f8fafc; border-left: 3px solid #1e293b; padding: 0.6rem 0.85rem;">
                    <div style="font-size: 0.6rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Employee</div>
                    <div style="font-size: 0.8rem; font-weight: 700; color: #0f172a; margin-top: 2px;">${fullName}</div>
                </div>
                <div style="background: #f8fafc; border-left: 3px solid #1e293b; padding: 0.6rem 0.85rem;">
                    <div style="font-size: 0.6rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Pay Period</div>
                    <div style="font-size: 0.8rem; font-weight: 700; color: #0f172a; margin-top: 2px;">${payPeriod}</div>
                </div>
                <div style="background: #f8fafc; border-left: 3px solid #1e293b; padding: 0.6rem 0.85rem;">
                    <div style="font-size: 0.6rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Issue Date</div>
                    <div style="font-size: 0.8rem; font-weight: 700; color: #0f172a; margin-top: 2px;">${issueDate}</div>
                </div>
                <div style="background: #f0fdf4; border-left: 3px solid #15803d; padding: 0.6rem 0.85rem;">
                    <div style="font-size: 0.6rem; color: #15803d; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Status</div>
                    <div style="font-size: 0.8rem; font-weight: 800; color: #15803d; margin-top: 2px;">✓ PAID</div>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                        <thead><tr style="background: #1e293b; color: white;">
                            <th style="padding: 0.5rem 0.75rem; text-align: left; font-weight: 600;" colspan="2">Earnings</th>
                        </tr></thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 0.5rem 0.75rem; color: #334155;">Basic Salary</td><td style="padding: 0.5rem 0.75rem; text-align: right; font-weight: 600;">${fmt(basic)}</td></tr>
                            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 0.5rem 0.75rem; color: #334155;">Allowances</td><td style="padding: 0.5rem 0.75rem; text-align: right; font-weight: 600;">${fmt(allow)}</td></tr>
                            <tr style="background: #f8fafc;"><td style="padding: 0.5rem 0.75rem; font-weight: 800; color: #0f172a;">Gross Pay</td><td style="padding: 0.5rem 0.75rem; text-align: right; font-weight: 800; color: #0f172a;">${fmt(gross)}</td></tr>
                        </tbody>
                    </table>
                </div>
                <div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                        <thead><tr style="background: #dc2626; color: white;">
                            <th style="padding: 0.5rem 0.75rem; text-align: left; font-weight: 600;" colspan="2">Deductions</th>
                        </tr></thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 0.5rem 0.75rem; color: #334155;">Withholding Tax</td><td style="padding: 0.5rem 0.75rem; text-align: right; font-weight: 600;">${fmt(tax)}</td></tr>
                            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 0.5rem 0.75rem; color: #334155;">SSS</td><td style="padding: 0.5rem 0.75rem; text-align: right; font-weight: 600;">${fmt(sss)}</td></tr>
                            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 0.5rem 0.75rem; color: #334155;">PhilHealth</td><td style="padding: 0.5rem 0.75rem; text-align: right; font-weight: 600;">${fmt(ph)}</td></tr>
                            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 0.5rem 0.75rem; color: #334155;">Pag-IBIG</td><td style="padding: 0.5rem 0.75rem; text-align: right; font-weight: 600;">${fmt(pagibig)}</td></tr>
                            <tr style="background: #fef2f2;"><td style="padding: 0.5rem 0.75rem; font-weight: 800; color: #991b1b;">Total Deductions</td><td style="padding: 0.5rem 0.75rem; text-align: right; font-weight: 800; color: #991b1b;">${fmt(totalDeductions)}</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 1.5rem;">
                <div style="text-align: center; min-width: 220px;">
                    ${sigHtml}
                    <div style="border-top: 2px solid #1e293b; margin-top: 0.4rem; padding-top: 0.3rem;"></div>
                    ${sigNameHtml}
                    <div style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">Finance Officer</div>
                </div>
                <div style="background: #0f172a; color: white; padding: 1rem 1.5rem; border-radius: 6px; text-align: center;">
                    <div style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.7;">Net Pay</div>
                    <div style="font-size: 1.5rem; font-weight: 800; margin-top: 4px;">${fmt(netPay)}</div>
                </div>
            </div>`;
    } else if (template === 'minimalist') {
        return `
            <div style="border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; margin-bottom: 1.5rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; border-bottom: 1px solid #e5e7eb;">
                    <div style="padding: 0.7rem 1rem; border-right: 1px solid #e5e7eb;">
                        <div style="font-size: 0.55rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px;">Employee</div>
                        <div style="font-size: 0.8rem; font-weight: 600; color: #111; margin-top: 2px;">${fullName}</div>
                    </div>
                    <div style="padding: 0.7rem 1rem; border-right: 1px solid #e5e7eb;">
                        <div style="font-size: 0.55rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px;">Pay Period</div>
                        <div style="font-size: 0.8rem; font-weight: 600; color: #111; margin-top: 2px;">${payPeriod}</div>
                    </div>
                    <div style="padding: 0.7rem 1rem;">
                        <div style="font-size: 0.55rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px;">Status</div>
                        <div style="font-size: 0.8rem; font-weight: 700; color: #15803d; margin-top: 2px;">Paid</div>
                    </div>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                <div>
                    <div style="font-size: 0.6rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 0.75rem; font-weight: 600;">Earnings</div>
                    <div style="border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden;">
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 0.85rem;">Basic Salary</span><span style="font-weight: 600; font-size: 0.85rem;">${fmt(basic)}</span></div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 0.85rem;">Allowances</span><span style="font-weight: 600; font-size: 0.85rem;">${fmt(allow)}</span></div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0.75rem; background: #fafafa;"><span style="font-weight: 700; font-size: 0.85rem;">Gross Pay</span><span style="font-weight: 700; font-size: 0.85rem;">${fmt(gross)}</span></div>
                    </div>
                </div>
                <div>
                    <div style="font-size: 0.6rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 0.75rem; font-weight: 600;">Deductions</div>
                    <div style="border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden;">
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 0.85rem;">Tax</span><span style="font-weight: 600; font-size: 0.85rem;">${fmt(tax)}</span></div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 0.85rem;">SSS</span><span style="font-weight: 600; font-size: 0.85rem;">${fmt(sss)}</span></div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 0.85rem;">PhilHealth</span><span style="font-weight: 600; font-size: 0.85rem;">${fmt(ph)}</span></div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 0.85rem;">Pag-IBIG</span><span style="font-weight: 600; font-size: 0.85rem;">${fmt(pagibig)}</span></div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0.75rem; background: #fafafa;"><span style="font-weight: 700; font-size: 0.85rem; color: #991b1b;">Total</span><span style="font-weight: 700; font-size: 0.85rem; color: #991b1b;">${fmt(totalDeductions)}</span></div>
                    </div>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 1.5rem;">
                <div style="text-align: center; min-width: 200px;">
                    ${sigHtml}
                    <div style="border-top: 1px solid #d1d5db; margin-top: 0.4rem; padding-top: 0.3rem;"></div>
                    ${sigNameHtml}
                    <div style="font-size: 0.7rem; color: #9ca3af;">Finance Officer</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.6rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px;">Net Pay</div>
                    <div style="font-size: 1.8rem; font-weight: 300; color: #111; letter-spacing: -0.5px; margin-top: 2px;">${fmt(netPay)}</div>
                </div>
            </div>`;
    } else if (template === 'corporate') {
        return `
            <div style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 0.85rem 1rem; margin-bottom: 1.25rem;">
                <div style="display: grid; grid-template-columns: 2fr 2fr 1.5fr 1fr; gap: 1rem; align-items: center;">
                    <div>
                        <div style="font-size: 0.55rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Employee Name</div>
                        <div style="font-size: 0.9rem; font-weight: 800; color: #0f172a; margin-top: 2px;">${fullName}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.55rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Pay Period</div>
                        <div style="font-size: 0.9rem; font-weight: 700; color: #0f172a; margin-top: 2px;">${payPeriod}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.55rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Issue Date</div>
                        <div style="font-size: 0.9rem; font-weight: 700; color: #0f172a; margin-top: 2px;">${issueDate}</div>
                    </div>
                    <div style="text-align: center;">
                        <span style="background: #dcfce7; color: #15803d; font-size: 0.7rem; font-weight: 800; padding: 0.25rem 0.75rem; border-radius: 3px; letter-spacing: 0.5px;">✓ PAID</span>
                    </div>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; border: 1px solid #cbd5e1;">
                    <thead><tr style="background: #0f172a; color: white;">
                        <th style="padding: 0.5rem 0.75rem; text-align: left; font-weight: 700; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.5px;" colspan="2">Earnings</th>
                    </tr></thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 0.5rem 0.75rem;">Basic Salary</td><td style="padding: 0.5rem 0.75rem; text-align: right; font-weight: 600;">${fmt(basic)}</td></tr>
                        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 0.5rem 0.75rem;">Allowances</td><td style="padding: 0.5rem 0.75rem; text-align: right; font-weight: 600;">${fmt(allow)}</td></tr>
                    </tbody>
                    <tfoot><tr style="background: #f8fafc; border-top: 2px solid #cbd5e1;"><td style="padding: 0.5rem 0.75rem; font-weight: 800;">Gross Pay</td><td style="padding: 0.5rem 0.75rem; text-align: right; font-weight: 800;">${fmt(gross)}</td></tr></tfoot>
                </table>
                <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; border: 1px solid #cbd5e1;">
                    <thead><tr style="background: #7f1d1d; color: white;">
                        <th style="padding: 0.5rem 0.75rem; text-align: left; font-weight: 700; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.5px;" colspan="2">Deductions</th>
                    </tr></thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 0.5rem 0.75rem;">Withholding Tax</td><td style="padding: 0.5rem 0.75rem; text-align: right; font-weight: 600;">${fmt(tax)}</td></tr>
                        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 0.5rem 0.75rem;">SSS</td><td style="padding: 0.5rem 0.75rem; text-align: right; font-weight: 600;">${fmt(sss)}</td></tr>
                        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 0.5rem 0.75rem;">PhilHealth</td><td style="padding: 0.5rem 0.75rem; text-align: right; font-weight: 600;">${fmt(ph)}</td></tr>
                        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 0.5rem 0.75rem;">Pag-IBIG</td><td style="padding: 0.5rem 0.75rem; text-align: right; font-weight: 600;">${fmt(pagibig)}</td></tr>
                    </tbody>
                    <tfoot><tr style="background: #fef2f2; border-top: 2px solid #cbd5e1;"><td style="padding: 0.5rem 0.75rem; font-weight: 800; color: #991b1b;">Total</td><td style="padding: 0.5rem 0.75rem; text-align: right; font-weight: 800; color: #991b1b;">${fmt(totalDeductions)}</td></tr></tfoot>
                </table>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 1.5rem;">
                <div style="display: inline-block; text-align: center; min-width: 240px;">
                    ${sigHtml}
                    <div style="border-top: 2px solid #0f172a; margin-top: 0.4rem; padding-top: 0.3rem;"></div>
                    ${sigNameHtml}
                    <div style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">Finance Officer / Authorized Signatory</div>
                </div>
                <div style="background: #0f172a; color: white; padding: 0.85rem 1.5rem; border-radius: 4px; text-align: center;">
                    <div style="font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.7;">Net Pay</div>
                    <div style="font-size: 1.4rem; font-weight: 800; margin-top: 3px;">${fmt(netPay)}</div>
                </div>
            </div>`;
    }

    // Classic fallback
    return `
        <div class="student-info-grid" style="margin-top:1rem;">
            <span class="info-label">Employee Name:</span>
            <span>${fullName}</span>
            <span class="info-label">Pay Period:</span>
            <span>${payPeriod}</span>
            <span class="info-label">Issue Date:</span>
            <span>${issueDate}</span>
            <span class="info-label">Status:</span>
            <span style="color: #15803d; font-weight: bold;">PAID</span>
        </div>

        <div class="payslip-container">
            <div class="payslip-section">
                <div class="payslip-section-title">Earnings</div>
                <div class="payslip-row"><span>Basic Salary</span><span>${fmt(basic)}</span></div>
                <div class="payslip-row"><span>Allowances</span><span>${fmt(allow)}</span></div>
                <div class="payslip-row total"><span>Gross Pay</span><span>${fmt(gross)}</span></div>
            </div>
            <div class="payslip-section">
                <div class="payslip-section-title">Deductions</div>
                <div class="payslip-row"><span>Withholding Tax</span><span>${fmt(tax)}</span></div>
                <div class="payslip-row"><span>SSS</span><span>${fmt(sss)}</span></div>
                <div class="payslip-row"><span>PhilHealth</span><span>${fmt(ph)}</span></div>
                <div class="payslip-row"><span>Pag-IBIG</span><span>${fmt(pagibig)}</span></div>
                <div class="payslip-row total"><span>Total Deductions</span><span>${fmt(totalDeductions)}</span></div>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 1.5rem;">
            <div class="signature-block" style="text-align: center; min-width: 240px;">
                ${sigHtml}
                <div class="sig-line"></div>
                ${sigNameHtml}
                <div class="sig-title">Finance Officer / Authorized Signatory</div>
            </div>
            <div class="payslip-net-box" style="float: none; margin-top: 0;">
                <div class="label">Net Pay</div>
                <div class="value">${fmt(netPay)}</div>
            </div>
        </div>`;
}

function renderLicenseBody(sigHtml, sigNameHtml, watermarkHtml) {
    const logoHtml = (state.customLogo || state.teacherLogo)
        ? `<img src="${(state.customLogo || state.teacherLogo)}" alt="School Logo" class="doc-logo" style="width:140px; height:140px; margin:0 auto; display:block;">`
        : `<div class="doc-logo" style="width:140px;height:140px;border:2px dashed #ccc;display:flex;align-items:center;justify-content:center;font-size:0.7rem;color:#aaa;border-radius:50%;margin:0 auto;">Logo</div>`;

    const schoolName = escapeHtml(state.teacherSchool || 'School Name');
    const fullName = escapeHtml(state.teacherFullname || 'Jane Smith');
    const profTitle = escapeHtml(state.teacherProfTitle || 'Licensed Professional Teacher');
    const licenseNo = escapeHtml(state.teacherLicenseNo || '—');
    const regDate = formatDate(state.teacherRegDate);
    const expDate = formatDate(state.teacherExpDate);

    // ── MODERN Template ──
    if (state.teacherTemplate === 'modern') {
        const logoSmall = (state.customLogo || state.teacherLogo)
            ? `<img src="${(state.customLogo || state.teacherLogo)}" alt="Logo" style="height: 70px; object-fit: contain;">`
            : '';
        return `
        <div class="license-wrapper" style="height: 100%;">
            ${watermarkHtml}
            <div style="height: 100%; display: flex; flex-direction: column; background: #fff; box-sizing: border-box; position: relative; overflow: hidden;">
                <!-- Ornamental top border -->
                <div style="height: 6px; background: linear-gradient(90deg, #1e3a5f 0%, #2563eb 40%, #1e3a5f 100%); flex-shrink: 0;"></div>
                <div style="height: 2px; background: #c9a84c; flex-shrink: 0;"></div>

                <!-- Header: Logo + School + Doc Title -->
                <div style="padding: 1.8rem 2.5rem 1rem; text-align: center; flex-shrink: 0;">
                    ${logoSmall}
                    <div style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 1.65rem; font-weight: 700; color: #1e293b; margin-top: 0.5rem; letter-spacing: 0.5px; line-height: 1.2;">${schoolName}</div>
                    <div style="font-size: 0.55rem; color: #94a3b8; margin-top: 0.35rem; letter-spacing: 0.3px;">${escapeHtml(state.teacherAddress || '')}</div>
                    <div style="margin-top: 0.75rem; display: inline-block; border-top: 1.5px solid #c9a84c; border-bottom: 1.5px solid #c9a84c; padding: 0.3rem 2rem;">
                        <div style="font-size: 0.8rem; font-weight: 700; color: #1e3a5f; letter-spacing: 4px; text-transform: uppercase;">Teaching License</div>
                    </div>
                </div>

                <!-- Body -->
                <div style="flex: 1; padding: 1rem 2.5rem 1.5rem; text-align: center; display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-size: 0.95rem; color: #64748b; font-style: italic;">This is to certify that</div>
                    <div style="font-size: 2.2rem; font-weight: 700; color: #1e293b; margin: 0.4rem 0 0.15rem; line-height: 1.15; font-family: 'Georgia', 'Times New Roman', serif;">${fullName}</div>
                    <div style="width: 65%; height: 1.5px; background: linear-gradient(90deg, transparent 0%, #1e3a5f 30%, #1e3a5f 70%, transparent 100%); margin: 0.15rem auto;"></div>
                    <div style="font-size: 0.95rem; color: #64748b; font-style: italic; margin-top: 0.75rem;">has fulfilled all professional requirements and is hereby recognized as</div>
                    <div style="font-size: 1.35rem; font-weight: 700; color: #1e3a5f; margin: 0.5rem 0; text-transform: uppercase; letter-spacing: 3px;">${profTitle}</div>

                    <!-- License details row -->
                    <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 1.25rem;">
                        <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.6rem 1.25rem; text-align: center; min-width: 120px; background: #fafbfc;">
                            <div style="font-size: 0.6rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">License No.</div>
                            <div style="font-size: 1rem; font-weight: 800; color: #1e293b; margin-top: 0.2rem; font-family: 'Courier New', monospace; letter-spacing: 0.5px;">${licenseNo}</div>
                        </div>
                        <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.6rem 1.25rem; text-align: center; min-width: 120px; background: #fafbfc;">
                            <div style="font-size: 0.6rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Issued</div>
                            <div style="font-size: 1rem; font-weight: 700; color: #1e293b; margin-top: 0.2rem;">${regDate}</div>
                        </div>
                        <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.6rem 1.25rem; text-align: center; min-width: 120px; background: #fafbfc;">
                            <div style="font-size: 0.6rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Valid Until</div>
                            <div style="font-size: 1rem; font-weight: 700; color: #1e293b; margin-top: 0.2rem;">${expDate}</div>
                        </div>
                    </div>

                    <!-- Dual signature area -->
                    <div style="margin-top: 2rem; display: flex; justify-content: center; gap: 4rem;">
                        <div style="text-align: center; min-width: 180px;">
                            ${sigHtml}
                            <div style="border-top: 1.5px solid #1e293b; margin-top: 0.5rem; padding-top: 0.3rem;"></div>
                            ${sigNameHtml}
                            <div style="font-size: 0.75rem; color: #94a3b8;">School Principal / Board Director</div>
                        </div>
                        <div style="text-align: center; min-width: 180px;">
                            <div style="height: 40px;"></div>
                            <div style="border-top: 1.5px solid #1e293b; margin-top: 0.5rem; padding-top: 0.3rem;"></div>
                            <div style="font-size: 0.85rem; font-weight: 600; color: #1e293b;">School Head</div>
                            <div style="font-size: 0.75rem; color: #94a3b8;">Authorized Official</div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div style="flex-shrink: 0; padding: 0.5rem 2.5rem 1rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9;">
                    <div style="font-size: 0.65rem; color: #cbd5e1;">Issued by ${schoolName}</div>
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        <span style="font-size: 0.65rem; font-weight: 700; color: #1e3a5f; letter-spacing: 1px;">AUTHENTICATED</span>
                    </div>
                </div>

                <div style="height: 2px; background: #c9a84c; flex-shrink: 0;"></div>
                <div style="height: 6px; background: linear-gradient(90deg, #1e3a5f 0%, #2563eb 40%, #1e3a5f 100%); flex-shrink: 0;"></div>
            </div>
        </div>`;
    }

    // ── MINIMALIST Template ──
    if (state.teacherTemplate === 'minimalist') {
        const logoSmall = (state.customLogo || state.teacherLogo)
            ? `<img src="${(state.customLogo || state.teacherLogo)}" alt="Logo" style="height: 55px; object-fit: contain;">`
            : '';
        return `
        <div class="license-wrapper" style="height: 100%;">
            ${watermarkHtml}
            <div style="height: 100%; display: flex; flex-direction: column; background: #fff; box-sizing: border-box; position: relative; overflow: hidden;">
                <!-- Thin refined top border -->
                <div style="height: 3px; background: #1a1a1a; flex-shrink: 0;"></div>
                <div style="height: 1px; background: #c9a84c; flex-shrink: 0;"></div>

                <div style="flex: 1; display: flex; flex-direction: column; padding: 2.5rem 3rem;">
                    <!-- Header: left-aligned institutional branding -->
                    <div style="display: flex; align-items: center; gap: 1rem; flex-shrink: 0; padding-bottom: 1.25rem; border-bottom: 1px solid #e5e7eb;">
                        ${logoSmall}
                        <div>
                            <div style="font-size: 0.65rem; font-weight: 600; letter-spacing: 3px; color: #94a3b8; text-transform: uppercase;">Professional Teaching License</div>
                            <div style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 1.35rem; font-weight: 700; color: #1a1a1a; margin-top: 0.2rem; letter-spacing: 0.3px;">${schoolName}</div>
                        </div>
                    </div>

                    <!-- Certificate body -->
                    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 1.5rem 0;">
                        <div style="font-size: 0.9rem; color: #6b7280; font-style: italic; margin-bottom: 0.5rem;">This is to certify that</div>
                        <div style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 2.4rem; font-weight: 400; color: #111; line-height: 1.1; letter-spacing: -0.3px;">${fullName}</div>
                        <div style="width: 100%; height: 1px; background: linear-gradient(90deg, #d1d5db 0%, #d1d5db 70%, transparent 100%); margin: 0.5rem 0 1rem 0;"></div>

                        <div style="font-size: 0.9rem; color: #6b7280; font-style: italic;">has met all professional requirements and is hereby granted the title of</div>
                        <div style="font-size: 1.25rem; font-weight: 600; color: #1a1a1a; margin-top: 0.5rem; text-transform: uppercase; letter-spacing: 2px;">${profTitle}</div>

                        <!-- License details in structured grid -->
                        <div style="margin-top: 1.75rem; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden;">
                            <div style="padding: 0.65rem 1rem; border-right: 1px solid #e5e7eb;">
                                <div style="font-size: 0.55rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">License No.</div>
                                <div style="font-size: 0.95rem; font-weight: 700; color: #1a1a1a; margin-top: 0.15rem; font-family: 'Courier New', monospace; letter-spacing: 0.5px;">${licenseNo}</div>
                            </div>
                            <div style="padding: 0.65rem 1rem; border-right: 1px solid #e5e7eb;">
                                <div style="font-size: 0.55rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Date Issued</div>
                                <div style="font-size: 0.95rem; font-weight: 600; color: #1a1a1a; margin-top: 0.15rem;">${regDate}</div>
                            </div>
                            <div style="padding: 0.65rem 1rem;">
                                <div style="font-size: 0.55rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Expiration</div>
                                <div style="font-size: 0.95rem; font-weight: 600; color: #1a1a1a; margin-top: 0.15rem;">${expDate}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Signature area: dual signatures -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-shrink: 0; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
                        <div style="text-align: center; min-width: 200px;">
                            ${sigHtml}
                            <div style="border-top: 1px solid #1a1a1a; margin-top: 0.4rem; padding-top: 0.3rem;"></div>
                            ${sigNameHtml}
                            <div style="font-size: 0.7rem; color: #9ca3af;">School Principal</div>
                        </div>
                        <div style="text-align: center; min-width: 160px;">
                            <div style="height: 40px;"></div>
                            <div style="border-top: 1px solid #1a1a1a; margin-top: 0.4rem; padding-top: 0.3rem;"></div>
                            <div style="font-size: 0.85rem; font-weight: 600; color: #1a1a1a;">Registrar</div>
                            <div style="font-size: 0.7rem; color: #9ca3af;">Authorized Official</div>
                        </div>
                    </div>
                </div>

                <div style="height: 1px; background: #c9a84c; flex-shrink: 0;"></div>
                <div style="height: 3px; background: #1a1a1a; flex-shrink: 0;"></div>
            </div>
        </div>`;
    }

    // ── CORPORATE Template ──
    if (state.teacherTemplate === 'corporate') {
        const logoSmall = (state.customLogo || state.teacherLogo)
            ? `<img src="${(state.customLogo || state.teacherLogo)}" alt="Logo" style="height: 50px; width: 50px; object-fit: contain; background: white; border-radius: 6px; padding: 4px;">`
            : '';
        return `
        <div class="license-wrapper">
            ${watermarkHtml}
            <div style="height: 100%; display: flex; flex-direction: column; background: #fff; box-sizing: border-box; position: relative; overflow: hidden;">
                <!-- Dark header -->
                <div style="background: #0f172a; color: white; padding: 2rem 2.5rem; display: flex; align-items: center; gap: 1.25rem; flex-shrink: 0;">
                    ${logoSmall}
                    <div>
                        <div style="font-size: 1.4rem; font-weight: 900; letter-spacing: 0.5px;">${schoolName}</div>
                        <div style="font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 3px; margin-top: 4px;">PROFESSIONAL TEACHING LICENSE</div>
                    </div>
                </div>

                <!-- Gold accent line -->
                <div style="height: 4px; background: linear-gradient(90deg, #c2a153 0%, #e8d48b 50%, #c2a153 100%); flex-shrink: 0;"></div>

                <!-- Body -->
                <div style="flex: 1; padding: 2rem 2.5rem; display: flex; flex-direction: column; justify-content: center; text-align: center;">
                    <div style="font-size: 0.9rem; color: #64748b; font-style: italic;">This document certifies that</div>

                    <div style="font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0.75rem 0; text-transform: uppercase; letter-spacing: 1px;">${fullName}</div>

                    <div style="width: 80px; height: 2px; background: #c2a153; margin: 0 auto;"></div>

                    <div style="font-size: 0.9rem; color: #64748b; font-style: italic; margin-top: 0.75rem;">has been duly qualified and is recognized under the professional title of</div>

                    <div style="font-size: 1.3rem; font-weight: 700; color: #c2a153; margin: 0.75rem 0; text-transform: uppercase; letter-spacing: 3px;">${profTitle}</div>

                    <!-- Details in card-style boxes -->
                    <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem 1.25rem; text-align: center; min-width: 130px;">
                            <div style="font-size: 0.6rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">License No.</div>
                            <div style="font-size: 1rem; font-weight: 800; color: #0f172a; margin-top: 0.25rem;">${licenseNo}</div>
                        </div>
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem 1.25rem; text-align: center; min-width: 130px;">
                            <div style="font-size: 0.6rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Registration</div>
                            <div style="font-size: 1rem; font-weight: 800; color: #0f172a; margin-top: 0.25rem;">${regDate}</div>
                        </div>
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem 1.25rem; text-align: center; min-width: 130px;">
                            <div style="font-size: 0.6rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Valid Until</div>
                            <div style="font-size: 1rem; font-weight: 800; color: #0f172a; margin-top: 0.25rem;">${expDate}</div>
                        </div>
                    </div>

                    <!-- Signature -->
                    <div style="margin-top: 2rem; display: flex; justify-content: center;">
                        <div style="text-align: center; min-width: 250px;">
                            ${sigHtml}
                            <div style="border-top: 2px solid #0f172a; margin-top: 0.5rem; padding-top: 0.35rem;"></div>
                            ${sigNameHtml}
                            <div style="font-size: 0.8rem; color: #64748b;">School Principal / Board Director</div>
                        </div>
                    </div>
                </div>

                <!-- Dark footer -->
                <div style="background: #0f172a; color: #94a3b8; padding: 1rem 2.5rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.7rem; flex-shrink: 0;">
                    <div>Issued by ${schoolName}</div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c2a153" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        <span style="color: #c2a153; font-weight: 600;">AUTHENTICATED</span>
                    </div>
                </div>
            </div>
        </div>`;
    }

    // ── CLASSIC Template (default / existing) ──
    return `
        <div class="license-wrapper">
            ${watermarkHtml}
            <div class="license-border">
                <div class="license-inner">
                    ${logoHtml}
                    <div class="license-header">${schoolName}</div>
                    <div class="license-subheader">OFFICIAL TEACHING LICENSE</div>
                    
                    <div class="license-certify">This is to officially certify that</div>
                    
                    <div class="license-name">${fullName}</div>
                    
                    <div class="license-certify">has met all professional requirements and is hereby granted the title of</div>
                    
                    <div class="license-title-text">${profTitle}</div>
                    
                    <div class="license-details-grid">
                        <div class="l-label">License Number:</div>
                        <div class="l-value">${licenseNo}</div>
                        <div class="l-label">Registration Date:</div>
                        <div class="l-value">${regDate}</div>
                        <div class="l-label">Valid Until:</div>
                        <div class="l-value">${expDate}</div>
                    </div>

                    <div style="margin-top: 1rem; width: 100%; text-align: center; padding-bottom: 0.5rem;">
                        <div style="display: inline-block; text-align: center; min-width: 280px;">
                            ${sigHtml}
                            <div class="sig-line"></div>
                            ${sigNameHtml}
                            <div class="sig-title">School Principal / Board Director</div>
                        </div>
                    </div>
                    
                    <div class="license-seal"></div>
                </div>
            </div>
        </div>
    `;
}

function renderTeacherIDBody(sigHtml, watermarkHtml) {
    const logoHtml = (state.customLogo || state.teacherLogo)
        ? `<img src="${(state.customLogo || state.teacherLogo)}" alt="School Logo" class="id-logo">`
        : `<div class="id-logo-placeholder">Logo</div>`;

    const photoHtml = state.teacherPhoto
        ? `<img src="${state.teacherPhoto}" alt="Teacher Photo" class="id-photo-img">`
        : `<div class="id-photo-placeholder">Photo</div>`;
        
    if (state.teacherTemplate === 'modern') {
        return `
            <div class="id-wrapper" style="border: none; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden; padding: 0; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); display: flex; flex-direction: column; height: 100%; box-sizing: border-box;">
                ${watermarkHtml}
                <div style="background: linear-gradient(90deg, var(--primary-color) 0%, #3b82f6 100%); color: white; padding: 1.5rem 1rem 3rem 1rem; text-align: center; position: relative; flex-shrink: 0;">
                    ${(state.customLogo || state.teacherLogo) ? `<img src="${(state.customLogo || state.teacherLogo)}" alt="School Logo" style="height: 40px; object-fit: contain; position: absolute; top: 1rem; left: 1rem;">` : ''}
                    <div style="font-weight: 800; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px;">${escapeHtml(state.teacherSchool || 'School Name')}</div>
                    <div style="font-size: 0.7rem; opacity: 0.9;">TEACHER IDENTIFICATION</div>
                </div>
                
                <div style="text-align: center; margin-top: -2.5rem; position: relative; z-index: 10; flex-shrink: 0;">
                    <div style="width: 100px; height: 100px; margin: 0 auto; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.15); overflow: hidden; background: white;">
                        ${state.teacherPhoto ? `<img src="${state.teacherPhoto}" alt="Teacher" style="width: 100%; height: 100%; object-fit: cover;">` : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:0.8rem;">Photo</div>`}
                    </div>
                </div>
                
                <div style="padding: 1rem; text-align: center; flex: 1; display: flex; flex-direction: column; position: relative; z-index: 2;">
                    <div style="font-size: 1.3rem; font-weight: 800; color: #0f172a; text-transform: uppercase;">${escapeHtml(state.teacherFullname || 'JUAN DELA CRUZ')}</div>
                    <div style="font-size: 0.85rem; font-weight: 600; color: var(--primary-color); margin-top: 4px;">${escapeHtml(state.teacherTitle || 'SENIOR HIGH SCHOOL TEACHER')}</div>
                    
                    <div style="background: white; border-radius: 8px; padding: 0.75rem; margin-top: auto; box-shadow: 0 2px 5px rgba(0,0,0,0.05); display: flex; justify-content: space-between; text-align: left;">
                        <div>
                            <div style="font-size: 0.6rem; color: #64748b; text-transform: uppercase;">Employee ID</div>
                            <div style="font-size: 0.9rem; font-weight: 700; color: #1e293b;">${escapeHtml(state.teacherIdNumber || 'TCH-2025-001')}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 0.6rem; color: #64748b; text-transform: uppercase;">Valid Until</div>
                            <div style="font-size: 0.9rem; font-weight: 700; color: #1e293b;">${state.teacherValidUntil ? formatDate(state.teacherValidUntil) : 'Dec 2026'}</div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 1.5rem; display: flex; align-items: flex-end; justify-content: center; gap: 2rem;">
                        <div style="text-align: center;">
                            <div class="id-sig-img-container" style="height: 30px; background: transparent;">${sigHtml}</div>
                            <div style="border-top: 1px solid #cbd5e1; width: 100px; margin-top: 4px; padding-top: 2px; font-size: 0.6rem; color: #64748b;">Signature</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (state.teacherTemplate === 'minimalist') {
        return `
            <div class="id-wrapper" style="border: 1px solid #f1f5f9; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(255,255,255,0.5); padding: 2rem; background: #ffffff; background-image: radial-gradient(circle at 100% 0%, rgba(var(--primary-color-rgb, 79, 70, 229), 0.03) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(0,0,0,0.01) 0%, transparent 50%); font-family: 'Inter', sans-serif; display: flex; flex-direction: column; height: 100%; box-sizing: border-box; position: relative; overflow: hidden;">
                
                <!-- Sleek Header -->
                <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; z-index: 2;">
                    <div style="display: flex; flex-direction: column;">
                        ${(state.customLogo || state.teacherLogo) ? `<img src="${(state.customLogo || state.teacherLogo)}" alt="Logo" style="height: 42px; object-fit: contain; margin-bottom: 0.5rem;">` : ''}
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.55rem; color: #94a3b8; letter-spacing: 0.15em; text-transform: uppercase; font-weight: 600;">Faculty ID</div>
                        <div style="font-size: 0.8rem; font-weight: 700; color: #334155; letter-spacing: -0.02em; margin-top: 2px;">${escapeHtml(state.teacherSchool || 'SCHOOL NAME')}</div>
                    </div>
                </div>
                
                <!-- Profile Section -->
                <div style="display: flex; gap: 1.5rem; align-items: center; margin-bottom: 2rem; z-index: 2;">
                    <div style="width: 100px; height: 100px; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 16px rgba(0,0,0,0.06); background: #f8fafc; flex-shrink: 0;">
                        ${state.teacherPhoto ? `<img src="${state.teacherPhoto}" alt="Teacher" style="width: 100%; height: 100%; object-fit: cover;">` : '<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#cbd5e1; font-size:0.8rem;">Photo</div>'}
                    </div>
                    <div style="display: flex; flex-direction: column;">
                        <div style="font-size: 1.6rem; font-weight: 800; color: #0f172a; line-height: 1.1; letter-spacing: -0.03em; margin-bottom: 0.25rem;">${escapeHtml(state.teacherFullname || 'Juan Dela Cruz')}</div>
                        <div style="font-size: 0.8rem; color: #64748b; font-weight: 500; letter-spacing: 0.01em;">${escapeHtml(state.teacherTitle || 'Senior High School Teacher')}</div>
                    </div>
                </div>
                
                <!-- Minimal Data Grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: auto; z-index: 2; border-top: 1px solid #f1f5f9; padding-top: 1.5rem;">
                    <div>
                        <div style="font-size: 0.5rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 4px;">ID Number</div>
                        <div style="font-size: 1rem; color: #0f172a; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: -0.02em;">${escapeHtml(state.teacherIdNumber || 'TCH-2025')}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.5rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 4px;">Valid Until</div>
                        <div style="font-size: 0.95rem; color: #0f172a; font-weight: 600;">${state.teacherValidUntil ? formatDate(state.teacherValidUntil) : 'Dec 2026'}</div>
                    </div>
                </div>

                <!-- Footer Signatures -->
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 1.5rem; z-index: 2;">
                    <div class="id-barcode" style="font-size: 2.4rem; line-height: 0.6; opacity: 0.7; transform: scaleY(0.8); transform-origin: left bottom; letter-spacing: 2px;">*${escapeHtml(state.teacherIdNumber || 'TCH')}*</div>
                    <div style="width: 80px; text-align: right;">
                        <div class="id-sig-img-container" style="height: 25px; align-items: flex-end; justify-content: flex-end; background: transparent; width: 100%; margin-bottom: 2px;">${sigHtml}</div>
                        <div style="border-top: 1px solid #e2e8f0; font-size: 0.45rem; color: #94a3b8; padding-top: 4px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Signature</div>
                    </div>
                </div>
            </div>
        `;
    } else if (state.teacherTemplate === 'corporate') {
        return `
            <div class="id-wrapper" style="border: none; border-radius: 12px; padding: 0; display: flex; flex-direction: column; background: #f8fafc; font-family: 'Inter', sans-serif; height: 100%; box-sizing: border-box; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.1);">
                
                <!-- Elite Corporate Header with Angled Cut -->
                <div style="background: linear-gradient(135deg, var(--primary-color) 0%, #0f172a 100%); clip-path: polygon(0 0, 100% 0, 100% 85%, 0% 100%); padding: 1.75rem 1.5rem 3rem 1.5rem; display: flex; align-items: flex-start; gap: 1rem; z-index: 2; position: relative;">
                    <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 8px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 4px 12px rgba(0,0,0,0.2); flex-shrink: 0;">
                        ${(state.customLogo || state.teacherLogo) ? `<img src="${(state.customLogo || state.teacherLogo)}" alt="Logo" style="height: 48px; width: 48px; object-fit: contain;">` : '<div style="height:48px;width:48px;display:flex;align-items:center;justify-content:center;color:white;font-size:0.7rem;font-weight:bold;">LOGO</div>'}
                    </div>
                    
                    <div style="color: white; padding-top: 4px;">
                        <div style="font-size: 0.95rem; font-weight: 800; letter-spacing: 0.02em; line-height: 1.2; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${escapeHtml(state.teacherSchool || 'SCHOOL NAME')}</div>
                        <div style="font-size: 0.55rem; color: rgba(255,255,255,0.7); text-transform: uppercase; margin-top: 4px; letter-spacing: 0.15em; font-weight: 600;">Staff / Faculty ID</div>
                    </div>
                </div>
                
                <!-- Main Content Area with Overlapping Photo -->
                <div style="padding: 0 1.5rem 1.5rem 1.5rem; display: flex; flex-direction: column; flex: 1; position: relative; z-index: 3; margin-top: -3.5rem;">
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.25rem;">
                        <div style="width: 100px; height: 130px; border-radius: 8px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); overflow: hidden; background: #ffffff; border: 3px solid #ffffff;">
                            ${state.teacherPhoto ? `<img src="${state.teacherPhoto}" alt="Teacher" style="width: 100%; height: 100%; object-fit: cover;">` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:0.8rem;background:#f1f5f9;">Photo</div>`}
                        </div>
                        
                        <!-- Mini QR or Badge Placeholder -->
                        <div style="width: 40px; height: 40px; border-radius: 6px; background: rgba(var(--primary-color-rgb, 79, 70, 229), 0.1); border: 1px solid rgba(var(--primary-color-rgb, 79, 70, 229), 0.2); display: flex; align-items: center; justify-content: center;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line></svg>
                        </div>
                    </div>
                    
                    <div>
                        <div style="font-size: 1.4rem; font-weight: 800; color: #0f172a; line-height: 1.1; margin-bottom: 0.25rem; letter-spacing: -0.02em;">${escapeHtml(state.teacherFullname || 'JUAN DELA CRUZ')}</div>
                        <div style="font-size: 0.75rem; font-weight: 600; color: var(--primary-color); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem;">${escapeHtml(state.teacherTitle || 'TEACHER')}</div>
                    </div>
                    
                    <div style="display: flex; gap: 1.5rem; background: #ffffff; padding: 0.75rem 1rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); margin-top: auto;">
                        <div>
                            <div style="font-size: 0.5rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px;">ID Number</div>
                            <div style="font-size: 0.85rem; font-weight: 800; color: #1e293b; font-family: 'Courier New', monospace;">${escapeHtml(state.teacherIdNumber || 'TCH-2025-001')}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.5rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px;">Valid Until</div>
                            <div style="font-size: 0.85rem; font-weight: 800; color: #1e293b;">${state.teacherValidUntil ? formatDate(state.teacherValidUntil) : 'Dec 2026'}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Bottom Tech Footer -->
                <div style="background: #0f172a; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
                    <div class="id-barcode" style="font-size: 2rem; line-height: 0.5; color: white; opacity: 0.9; transform: scaleY(0.7); transform-origin: left center;">*${escapeHtml(state.teacherIdNumber || 'TCH')}*</div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end; width: 80px;">
                        <div class="id-sig-img-container" style="height: 22px; justify-content: flex-end; align-items: center; background: transparent; filter: invert(1) brightness(2);">${sigHtml}</div>
                    </div>
                </div>
            </div>
        `;
    }

    return `
        <div class="id-wrapper">
            ${watermarkHtml}
            
            <div class="id-header">
                ${logoHtml}
                <div class="id-header-text">
                    <div class="id-school-name">${escapeHtml(state.teacherSchool || 'MAPÚA MCL SENIOR HIGH SCHOOL').toUpperCase()}</div>
                    <div class="id-address">${escapeHtml(state.teacherAddress || '658 Muralla St, Intramuros, 1002 Metro Manila')}</div>
                </div>
            </div>
            
            <div class="id-type-banner">TEACHER IDENTIFICATION CARD</div>
            
            <div class="id-body-content">
                <div class="id-photo-container">
                    ${photoHtml}
                </div>
                
                <div class="id-info-center">
                    <div class="id-name">${escapeHtml(state.teacherFullname || 'JUAN DELA CRUZ').toUpperCase()}</div>
                    <div class="id-position">${escapeHtml(state.teacherTitle || 'SENIOR HIGH SCHOOL TEACHER').toUpperCase()}</div>
                    
                    <div class="id-details-grid">
                        <div class="id-detail-row">
                            <span class="id-detail-label">ID NO:</span>
                            <span class="id-detail-value">${escapeHtml(state.teacherIdNumber || 'TCH-2025-001')}</span>
                        </div>
                        <div class="id-detail-row">
                            <span class="id-detail-label">VALID UNTIL:</span>
                            <span class="id-detail-value">${state.teacherValidUntil ? formatDate(state.teacherValidUntil).toUpperCase() : 'DECEMBER 31, 2026'}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="id-footer">
                <div class="id-signature-box">
                    <div class="id-sig-img-container">${sigHtml}</div>
                    <div class="id-sig-line"></div>
                    <div class="id-sig-label">Cardholder's Signature</div>
                </div>
                <div class="id-seal-box">
                    <div class="id-seal-stamp">Verified</div>
                </div>
            </div>
            
            <div class="id-barcode-container">
                <div class="id-barcode">*${escapeHtml(state.teacherIdNumber || 'TCH-2025-001')}*</div>
            </div>
        </div>
    `;
}

// ==========================================================================
// 11. Validation
// ==========================================================================
function validateForm() {
    let valid = true;
    const activeForm = document.querySelector('.form-module.active');
    const requiredFields = activeForm.querySelectorAll('input[required], select[required], textarea[required]');

    // Clear previous errors
    activeForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

    requiredFields.forEach(field => {
        if (field.type === 'file') return;
        if (!field.value.trim()) {
            field.classList.add('error');
            valid = false;
        }
    });

    // Also validate dynamic fields if on student module
    if (state.activeModule === 'student-module' && studentDynamicFields) {
        const dynamicRequired = studentDynamicFields.querySelectorAll('input[required], select[required], textarea[required]');
        dynamicRequired.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                valid = false;
            }
        });
    } else if (state.activeModule === 'teacher-module' && teacherDynamicFields) {
        const dynamicRequired = teacherDynamicFields.querySelectorAll('input[required], select[required], textarea[required]');
        dynamicRequired.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                valid = false;
            }
        });
    }

    return valid;
}

// ==========================================================================
// 12. PDF Export via html2pdf.js
// ==========================================================================
function exportPDF() {
    if (!validateForm()) {
        const firstError = document.querySelector('.error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    const element = document.getElementById('document-render');
    const isStudent = state.activeModule === 'student-module';

    let filename = getExportFilename(isStudent);

    const opt = {
        margin: 0,
        filename: `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 4,
            useCORS: true,
            letterRendering: true,
        },
        jsPDF: {
            unit: 'in',
            format: 'letter',
            orientation: 'portrait',
        },
    };

    // Override formats for specific document types
    if (!isStudent) {
        if (state.teacherDocType === 'idcard') {
            opt.jsPDF.format = [3.4, 5.4]; // Custom ID Card size
            opt.jsPDF.orientation = 'portrait';
        } else if (state.teacherDocType === 'license') {
            opt.jsPDF.format = 'letter';
            opt.jsPDF.orientation = 'landscape';
        }
    } else {
        if (state.studentDocType === 'idcard') {
            opt.jsPDF.format = [3.4, 5.4]; // Custom ID Card size
            opt.jsPDF.orientation = 'portrait';
        }
    }

    const btn = document.getElementById('btn-export-pdf');
    if(btn) { btn.disabled = true; btn.textContent = 'Generating PDF...'; }

    html2pdf().set(opt).from(element).save().then(() => {
        restoreExportBtns();
    }).catch(() => {
        restoreExportBtns();
    });
}

function getExportFilename(isStudent) {
    if (isStudent) {
        const name = `${state.studentFname || 'Student'}_${state.studentLname || ''}`.replace(/\s+/g, '_').trim();
        return `${name}_${state.studentDocType}`;
    } else {
        const name = (state.teacherFullname || 'Teacher').replace(/\s+/g, '_').trim();
        return `${name}_${state.teacherDocType}`;
    }
}

function exportImage(format) {
    if (!validateForm()) {
        const firstError = document.querySelector('.error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    const element = document.getElementById('document-render');
    const isStudent = state.activeModule === 'student-module';
    const filename = getExportFilename(isStudent);

    const btn = document.getElementById(`btn-export-${format}`);
    if(btn) { btn.disabled = true; btn.textContent = 'Generating...'; }

    html2canvas(element, {
        scale: 4,
        useCORS: true,
        letterRendering: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${filename}.${format}`;
        link.href = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`, 0.98);
        link.click();
        restoreExportBtns();
    }).catch(() => {
        restoreExportBtns();
    });
}

function restoreExportBtns() {
    const pdfBtn = document.getElementById('btn-export-pdf');
    if (pdfBtn) {
        pdfBtn.disabled = false;
        pdfBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download PDF`;
    }
    
    const pngBtn = document.getElementById('btn-export-png');
    if(pngBtn) { pngBtn.disabled = false; pngBtn.textContent = 'Download PNG'; }
    
    const jpgBtn = document.getElementById('btn-export-jpg');
    if(jpgBtn) { jpgBtn.disabled = false; jpgBtn.textContent = 'Download JPG'; }
}

// ==========================================================================
// 13. Clear Data
// ==========================================================================
function showConfirmModal(message, onConfirm) {
    const modalHtml = `
        <div id="custom-confirm-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(4px); opacity: 0; transition: opacity 0.2s ease-in-out;">
            <div style="background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 400px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); transform: translateY(20px); transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <h3 style="margin-top: 0; margin-bottom: 12px; color: #0f172a; font-size: 1.2rem; font-weight: 700;">Confirm Action</h3>
                <p style="margin: 0 0 24px 0; color: #475569; font-size: 0.95rem; line-height: 1.5;">${message}</p>
                <div style="display: flex; justify-content: flex-end; gap: 12px;">
                    <button id="modal-cancel-btn" style="padding: 8px 16px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; color: #475569; font-weight: 600; cursor: pointer;">Cancel</button>
                    <button id="modal-confirm-btn" style="padding: 8px 16px; border-radius: 6px; border: none; background: #ef4444; color: white; font-weight: 600; cursor: pointer;">Clear Data</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('custom-confirm-modal');
    const modalBox = modal.querySelector('div');
    
    // Trigger animation
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
        modalBox.style.transform = 'translateY(0)';
    });
    
    function closeModal() {
        modal.style.opacity = '0';
        modalBox.style.transform = 'translateY(20px)';
        setTimeout(() => modal.remove(), 200);
    }
    
    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
    
    document.getElementById('modal-confirm-btn').addEventListener('click', () => {
        closeModal();
        if (onConfirm) onConfirm();
    });
}

function clearAllData() {
    showConfirmModal('Are you sure you want to clear all form data? This cannot be undone.', () => {
        const currentModule = state.activeModule;
        localStorage.removeItem(STATE_KEY);
        state = { ...defaultState, activeModule: currentModule };
        populateInputsFromState();
        renderDynamicFields();
        renderTeacherDynamicFields();
        renderPreview();
    
        // Reset file inputs
        document.querySelectorAll('input[type="file"]').forEach(el => { el.value = ''; });
    });
}

// ==========================================================================
// 14. Zoom Controls
// ==========================================================================
function updateZoom() {
    if (!paperContainer) return;
    // Clear any CSS animation that may override the transform
    paperContainer.style.animation = 'none';
    paperContainer.style.transform = `scale(${currentZoom / 100})`;
    const zoomLabel = $('#zoom-level');
    if (zoomLabel) zoomLabel.textContent = `${currentZoom}%`;
}

// ==========================================================================
// 15. Initialization
// ==========================================================================
function init() {
    // Cache DOM references
    renderContent = $('#render-content');
    studentDynamicFields = $('#student-dynamic-fields');
    teacherDynamicFields = $('#teacher-dynamic-fields');
    clearBtn = $('#btn-clear');
    paperContainer = $('.paper-container');

    // Load state from localStorage
    loadState();
    populateInputsFromState();
    activateTab(state.activeModule);
    renderDynamicFields();
    renderTeacherDynamicFields();
    bindAllInputs();
    initFileUploads();
    renderPreview();

    // Export events
    const pdfBtn = $('#btn-export-pdf');
    if (pdfBtn) pdfBtn.addEventListener('click', exportPDF);
    
    const pngBtn = $('#btn-export-png');
    if (pngBtn) pngBtn.addEventListener('click', () => exportImage('png'));
    
    const jpgBtn = $('#btn-export-jpg');
    if (jpgBtn) jpgBtn.addEventListener('click', () => exportImage('jpg'));

    // Clear event
    if (clearBtn) clearBtn.addEventListener('click', clearAllData);

    // Color picker binding
    const colorPicker = $('#primary-color');
    if (colorPicker) {
        colorPicker.addEventListener('input', (e) => {
            document.documentElement.style.setProperty('--primary-color', e.target.value);
            state.primaryColor = e.target.value;
            saveState();
        });
        if (state.primaryColor) {
            colorPicker.value = state.primaryColor;
            document.documentElement.style.setProperty('--primary-color', state.primaryColor);
        }
    }
    
    // QR Code Toggle
    const qrToggle = $('#qr-toggle');
    if (qrToggle) {
        qrToggle.addEventListener('change', (e) => {
            state.qrEnabled = e.target.checked;
            saveState();
            renderPreview();
        });
        if (state.qrEnabled) {
            qrToggle.checked = true;
        }
    }

    // Presets Management
    updatePresetDropdown();
    
    const btnLoadPreset = $('#btn-load-preset');
    if (btnLoadPreset) {
        btnLoadPreset.addEventListener('click', () => {
            const presetName = $('#preset-list').value;
            if (presetName) loadPreset(presetName);
        });
    }
    
    const btnSavePreset = $('#btn-save-preset');
    if (btnSavePreset) {
        btnSavePreset.addEventListener('click', () => {
            const presetName = $('#preset-name-input').value.trim();
            if (presetName) {
                savePreset(presetName);
                $('#preset-name-input').value = '';
                $('#preset-list').value = presetName;
            }
        });
    }
    
    const btnDeletePreset = $('#btn-delete-preset');
    if (btnDeletePreset) {
        btnDeletePreset.addEventListener('click', () => {
            const presetName = $('#preset-list').value;
            if (presetName && confirm(`Delete preset "${presetName}"?`)) {
                deletePreset(presetName);
            }
        });
    }

    // Zoom controls
    const zoomInBtn = $('#zoom-in');
    const zoomOutBtn = $('#zoom-out');
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            if (currentZoom < 150) { currentZoom += 10; updateZoom(); }
        });
    }
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            if (currentZoom > 50) { currentZoom -= 10; updateZoom(); }
        });
    }

    // Watch for doc type change
    const docTypeSelect = $('#student-doc-type');
    if (docTypeSelect) {
        docTypeSelect.addEventListener('change', () => {
            state.studentDocType = docTypeSelect.value;
            saveState();
            renderDynamicFields();
            renderPreview();
        });
    }

    const teacherDocTypeSelect = $('#teacher-doc-type');
    if (teacherDocTypeSelect) {
        teacherDocTypeSelect.addEventListener('change', () => {
            state.teacherDocType = teacherDocTypeSelect.value;
            saveState();
            renderTeacherDynamicFields();
            renderPreview();
        });
    }

    // Tab switching
    $$('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => activateTab(btn.dataset.target));
    });

    // Auto-update logo when school name perfectly matches a known university
    const studentSchoolInput = $('#student-school');
    if (studentSchoolInput) {
        studentSchoolInput.addEventListener('change', (e) => {
            handleSchoolNameLogoSync('studentLogo', e.target.value);
        });
    }

    const teacherSchoolInput = $('#teacher-school');
    if (teacherSchoolInput) {
        teacherSchoolInput.addEventListener('change', (e) => {
            handleSchoolNameLogoSync('teacherLogo', e.target.value);
        });
    }
}

// Wait for DOM
document.addEventListener('DOMContentLoaded', init);

// ==========================================================================
// Utils
// ==========================================================================

window.updateCurrency = function(currencyStr) {
    state.globalCurrency = currencyStr;
    saveState();
    renderPreview();
};

function formatCurrency(amount) {
    const cur = state.globalCurrency || '?';
    const val = parseFloat(amount);
    if (isNaN(val)) return cur + ' 0.00';
    return cur + ' ' + val.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

// ==========================================================================
// PRESETS LOGIC
// ==========================================================================
const PRESETS_KEY = 'docgen_pro_presets_v1';

function savePreset(name) {
    const presetsStr = localStorage.getItem(PRESETS_KEY);
    let presets = {};
    if (presetsStr) {
        try { presets = JSON.parse(presetsStr); } catch (e) {}
    }
    presets[name] = state;
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
    updatePresetDropdown();
}

function loadPreset(name) {
    const presetsStr = localStorage.getItem(PRESETS_KEY);
    if (!presetsStr) return;
    try {
        const presets = JSON.parse(presetsStr);
        if (presets[name]) {
            state = { ...defaultState, ...presets[name] };
            saveState();
            
            // Re-apply visual things
            if (state.primaryColor) {
                document.documentElement.style.setProperty('--primary-color', state.primaryColor);
            }
            
            // Reload UI
            populateInputsFromState();
            activateTab(state.activeModule || 'student-module');
            renderDynamicFields();
            renderTeacherDynamicFields();
            renderPreview();
        }
    } catch (e) {}
}

function deletePreset(name) {
    const presetsStr = localStorage.getItem(PRESETS_KEY);
    if (!presetsStr) return;
    try {
        const presets = JSON.parse(presetsStr);
        if (presets[name]) {
            delete presets[name];
            localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
            updatePresetDropdown();
        }
    } catch (e) {}
}

function updatePresetDropdown() {
    const list = document.getElementById('preset-list');
    if (!list) return;
    
    const presetsStr = localStorage.getItem(PRESETS_KEY);
    let presets = {};
    if (presetsStr) {
        try { presets = JSON.parse(presetsStr); } catch (e) {}
    }
    
    list.innerHTML = '<option value="">-- Select Preset --</option>';
    Object.keys(presets).forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        list.appendChild(opt);
    });
}

/* ==========================================================================
   Security Deterrents (Anti-Screenshot / Anti-Copy)
   Scoped to preview panel only — form inputs remain fully functional.
   ========================================================================== */

// 1. Disable Right-Click on preview panel only
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.preview-panel')) {
        e.preventDefault();
    }
});

// 2. Disable Keyboard Shortcuts (PrintScreen, Ctrl+P, Ctrl+S, Ctrl+U)
//    Ctrl+C is only blocked when focus is inside the preview panel.
document.addEventListener('keydown', (e) => {
    // Print Screen Key
    if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('Screenshots are disabled for security reasons.');
        document.body.style.filter = 'blur(20px)';
        setTimeout(() => {
            document.body.style.filter = 'none';
        }, 1000);
    }
    
    const isInPreview = document.activeElement && document.activeElement.closest('.preview-panel');
    
    // Ctrl shortcuts
    if (e.ctrlKey) {
        if (e.key === 'p' || e.key === 's' || e.key === 'u') {
            e.preventDefault();
        }
        // Only block copy inside the preview panel
        if (e.key === 'c' && isInPreview) {
            e.preventDefault();
        }
    }
    
    // Mac Cmd shortcuts
    if (e.metaKey) {
        if (e.key === 'p' || e.key === 's' || e.key === 'u') {
            e.preventDefault();
        }
        if (e.key === 'c' && isInPreview) {
            e.preventDefault();
        }
    }
});

// 3. Disable Dragging of Images
document.addEventListener('dragstart', (e) => {
    if (e.target.nodeName.toUpperCase() === 'IMG') {
        e.preventDefault();
    }
});
