import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Printer, ChevronUp, FileText } from 'lucide-react';

// ============================================================================
// Type Definitions
// ============================================================================

interface TermsSection {
  section_id: string;
  section_number: string;
  section_title: string;
  section_content: string;
  subsections?: TermsSubsection[];
}

interface TermsSubsection {
  subsection_id: string;
  subsection_title: string;
  subsection_content: string;
}

interface TermsContent {
  document_title: string;
  last_updated: string;
  effective_date: string;
  sections: TermsSection[];
}

interface TOCItem {
  section_id: string;
  section_title: string;
  anchor: string;
}

// ============================================================================
// UV_TermsOfService Component
// ============================================================================

const UV_TermsOfService: React.FC = () => {
  // ========================================================================
  // Global State Access - CRITICAL: Individual selectors
  // ========================================================================
  
  // const currentUser = useAppStore(state => state.authentication_state.current_user); // unused
  // const authToken = useAppStore(state => state.authentication_state.auth_token); // unused
  
  // ========================================================================
  // Local State
  // ========================================================================
  
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const [mobileTocOpen, setMobileTocOpen] = useState<boolean>(false);
  
  // ========================================================================
  // Refs
  // ========================================================================
  
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  
  // ========================================================================
  // Static Terms Content
  // ========================================================================
  
  const termsContent: TermsContent = {
    document_title: 'BuildEasy Terms of Service',
    last_updated: 'December 10, 2024',
    effective_date: 'January 1, 2024',
    sections: [
      {
        section_id: 'introduction',
        section_number: '1',
        section_title: 'Introduction',
        section_content: `Welcome to BuildEasy, an online marketplace platform connecting buyers with construction material suppliers ("Platform," "we," "us," or "our"). These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and BuildEasy, governing your access to and use of our Platform.\n\nBuildEasy operates as a marketplace intermediary, facilitating transactions between independent buyers and sellers of construction materials. We provide the technology platform but are not a party to transactions between buyers and suppliers.\n\nBy accessing or using BuildEasy, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy and Cookie Policy, which are incorporated by reference.`,
      },
      {
        section_id: 'acceptance',
        section_number: '2',
        section_title: 'Acceptance of Terms',
        section_content: `By creating an account, browsing the Platform, making a purchase, or listing products for sale, you affirm that:\n\n• You are at least 18 years of age or the age of majority in your jurisdiction\n• You have the legal capacity to enter into binding contracts\n• You will comply with all applicable laws and regulations\n• All information you provide is accurate, current, and complete\n\nIf you do not agree to these Terms, you must immediately cease using the Platform. Continued use after any modifications to these Terms constitutes acceptance of the updated Terms.`,
      },
      {
        section_id: 'account-registration',
        section_number: '3',
        section_title: 'Account Registration',
        section_content: `To access certain features of the Platform, you must create an account. Account registration requires accurate information and compliance with security requirements.`,
        subsections: [
          {
            subsection_id: 'eligibility',
            subsection_title: '3.1 Eligibility',
            subsection_content: `You must be at least 18 years old and legally capable of entering contracts. Business accounts require valid business registration documentation. Contractors and project managers must provide accurate professional credentials when requested.`,
          },
          {
            subsection_id: 'account-security',
            subsection_title: '3.2 Account Security',
            subsection_content: `You are responsible for:\n\n• Maintaining the confidentiality of your password and account credentials\n• All activities that occur under your account\n• Notifying us immediately of any unauthorized access or security breach\n• Using strong, unique passwords and changing them regularly\n\nWe recommend enabling two-factor authentication when available. You must not share your account credentials with others or allow others to access your account. We are not liable for any loss or damage arising from your failure to maintain account security.`,
          },
          {
            subsection_id: 'account-accuracy',
            subsection_title: '3.3 Account Information Accuracy',
            subsection_content: `You agree to provide accurate, current, and complete information during registration and to update such information to maintain accuracy. Providing false, misleading, or fraudulent information may result in account suspension or termination.\n\nFor business accounts, you must provide valid business registration numbers, tax identification, and proof of business operations. Suppliers must provide additional verification documents as required.`,
          },
          {
            subsection_id: 'account-liability',
            subsection_title: '3.4 Liability for Account Activity',
            subsection_content: `You are fully responsible for all activities conducted through your account, whether authorized or unauthorized. This includes all orders placed, listings created, reviews posted, and communications sent. You agree to indemnify BuildEasy for any claims arising from account misuse.`,
          },
        ],
      },
      {
        section_id: 'user-conduct',
        section_number: '4',
        section_title: 'User Conduct and Prohibited Activities',
        section_content: `All users must conduct themselves professionally and lawfully. The following activities are strictly prohibited:`,
        subsections: [
          {
            subsection_id: 'prohibited-activities',
            subsection_title: '4.1 Prohibited Activities',
            subsection_content: `• Fraud, deception, or misrepresentation in any form\n• Selling counterfeit, stolen, or prohibited materials\n• Price manipulation or coordinated pricing schemes\n• Harassment, abuse, or threatening behavior toward other users\n• Posting false, defamatory, or misleading reviews\n• Creating multiple accounts to manipulate ratings or reviews\n• Attempting to circumvent payment systems or fees\n• Unauthorized access to other users' accounts or data\n• Using automated systems (bots) to scrape data or manipulate listings\n• Any activity that violates local, state, or federal laws`,
          },
          {
            subsection_id: 'content-restrictions',
            subsection_title: '4.2 Content Restrictions',
            subsection_content: `You agree not to post, transmit, or share content that:\n\n• Infringes intellectual property rights\n• Contains malicious code or viruses\n• Is obscene, pornographic, or sexually explicit\n• Promotes violence, discrimination, or illegal activities\n• Violates privacy rights of others\n• Contains personal information without consent\n• Is spam, unsolicited advertising, or commercial solicitation`,
          },
          {
            subsection_id: 'consequences',
            subsection_title: '4.3 Consequences of Violations',
            subsection_content: `Violations of these conduct standards may result in:\n\n• Warning notice\n• Content removal\n• Temporary account suspension (7-30 days)\n• Permanent account termination\n• Legal action and cooperation with law enforcement\n• Forfeiture of funds or credits\n\nBuildEasy reserves the right to determine violations and appropriate remedies at our sole discretion. Repeat offenders will face permanent bans.`,
          },
        ],
      },
      {
        section_id: 'marketplace-usage',
        section_number: '5',
        section_title: 'Marketplace Usage',
        section_content: `BuildEasy facilitates connections between buyers and sellers but is not a party to individual transactions.`,
        subsections: [
          {
            subsection_id: 'buyer-seller-relationship',
            subsection_title: '5.1 Buyer-Seller Relationship',
            subsection_content: `Transactions occur directly between buyers and suppliers. BuildEasy provides the platform facilitating these transactions but does not:\n\n• Take title to products sold\n• Control product quality, safety, or legality\n• Guarantee delivery or supplier performance\n• Assume liability for transaction disputes\n\nThe legal contract for each sale is between the buyer and the specific supplier, not with BuildEasy.`,
          },
          {
            subsection_id: 'platform-role',
            subsection_title: '5.2 Platform Role as Intermediary',
            subsection_content: `BuildEasy acts solely as an intermediary marketplace platform. We provide:\n\n• Technology infrastructure for listings and transactions\n• Payment processing services as agent for suppliers\n• Communication tools between buyers and suppliers\n• Dispute resolution assistance\n\nWe do not manufacture, warehouse, or ship products unless explicitly stated. We do not guarantee product availability, quality, or suitability for any purpose.`,
          },
          {
            subsection_id: 'liability-limitations',
            subsection_title: '5.3 Liability Limitations',
            subsection_content: `BuildEasy is not liable for:\n\n• Product defects, damages, or injuries caused by purchased materials\n• Supplier non-performance, late delivery, or failure to fulfill orders\n• Misrepresentation of products by suppliers\n• Losses arising from transactions between users\n• Third-party content, including reviews and listings\n\nUsers acknowledge that BuildEasy cannot control all aspects of transactions and should exercise due diligence when purchasing or selling.`,
          },
        ],
      },
      {
        section_id: 'product-listings',
        section_number: '6',
        section_title: 'Product Listings (For Suppliers)',
        section_content: `Suppliers listing products on BuildEasy must comply with the following requirements:`,
        subsections: [
          {
            subsection_id: 'accuracy-requirements',
            subsection_title: '6.1 Listing Accuracy',
            subsection_content: `All product listings must:\n\n• Accurately describe the product, including specifications, dimensions, materials, and condition\n• Display correct, current pricing\n• Reflect actual inventory availability\n• Include clear, unaltered product photographs\n• Disclose any defects, limitations, or special handling requirements\n• Comply with all applicable safety standards and regulations\n\nSuppliers are responsible for maintaining accurate listings and updating information promptly when changes occur.`,
          },
          {
            subsection_id: 'prohibited-products',
            subsection_title: '6.2 Prohibited Products',
            subsection_content: `The following products may not be listed on BuildEasy:\n\n• Stolen goods or goods infringing intellectual property rights\n• Counterfeit or replica products\n• Products recalled by manufacturers or regulatory agencies\n• Hazardous materials not properly classified and shipped\n• Products violating environmental regulations\n• Items restricted or prohibited by law\n• Products requiring special licenses without proper documentation\n\nBuildEasy reserves the right to remove any listing at our discretion and may suspend suppliers listing prohibited products.`,
          },
          {
            subsection_id: 'ip-rights',
            subsection_title: '6.3 Intellectual Property Rights',
            subsection_content: `Suppliers represent and warrant that:\n\n• They own or have licenses for all product images, descriptions, and trademarks used in listings\n• Listings do not infringe patents, copyrights, trademarks, or trade secrets of third parties\n• They have authority to sell all listed products\n\nSuppliers agree to indemnify BuildEasy against any intellectual property claims arising from their listings. We will respond to valid DMCA takedown notices and may terminate accounts of repeat infringers.`,
          },
        ],
      },
      {
        section_id: 'orders-transactions',
        section_number: '7',
        section_title: 'Orders and Transactions',
        section_content: ``,
        subsections: [
          {
            subsection_id: 'order-placement',
            subsection_title: '7.1 Order Placement',
            subsection_content: `When you place an order:\n\n• Your order constitutes an offer to purchase from the supplier\n• The supplier may accept or decline your order\n• A binding contract forms when the supplier accepts your order\n• You authorize payment processing upon order acceptance\n• Prices are confirmed at time of order acceptance\n• Orders may be subject to quantity limitations\n\nBuildEasy reserves inventory for 15 minutes after adding to cart. Inventory is not guaranteed until order is accepted by supplier.`,
          },
          {
            subsection_id: 'payment-processing',
            subsection_title: '7.2 Payment Processing',
            subsection_content: `BuildEasy processes payments as agent for suppliers using secure third-party payment processors. By making a purchase, you agree to:\n\n• Provide valid payment method information\n• Authorize BuildEasy to charge the payment method\n• Pay all applicable fees, taxes, and delivery costs\n• Resolve payment disputes directly with your financial institution\n\nPayment methods accepted include credit cards, debit cards, PayPal, and trade credit (for approved business accounts). Payment is processed when supplier accepts your order. For trade credit customers, payment terms (Net 30, Net 60) apply as specified in your credit agreement.`,
          },
          {
            subsection_id: 'cancellation',
            subsection_title: '7.3 Order Cancellation',
            subsection_content: `Customers may cancel orders:\n\n• Before supplier accepts the order: Full refund with no penalty\n• After acceptance but before shipping: Subject to supplier approval, may incur cancellation fees\n• After shipping: Returns policy applies\n\nSuppliers may cancel orders:\n\n• Within 24 hours of order placement if unable to fulfill\n• If product becomes unavailable due to circumstances beyond control\n• If customer information is fraudulent or invalid\n\nAutomatic cancellation occurs if supplier does not accept order within 48 hours. Full refund processed within 5-7 business days.`,
          },
          {
            subsection_id: 'refund-policies',
            subsection_title: '7.4 Refund Policies',
            subsection_content: `Refunds are processed to the original payment method used for purchase:\n\n• Order canceled before shipment: 100% refund within 5-7 business days\n• Returned items: Refund amount less return shipping costs and restocking fees (if applicable)\n• Defective items: Full refund including original shipping costs\n• Denied orders: Immediate refund processed automatically\n\nTrade credit customers receive credit adjustment instead of monetary refund. Refunds do not include non-refundable fees such as expedited shipping charges unless product was defective or incorrectly shipped.`,
          },
        ],
      },
      {
        section_id: 'delivery-shipping',
        section_number: '8',
        section_title: 'Delivery and Shipping',
        section_content: ``,
        subsections: [
          {
            subsection_id: 'delivery-responsibilities',
            subsection_title: '8.1 Delivery Responsibilities',
            subsection_content: `Suppliers are responsible for:\n\n• Packaging products securely to prevent damage during transit\n• Shipping within promised timeframes\n• Providing accurate tracking information\n• Complying with hazardous material shipping regulations\n• Delivering to the address provided by customer\n\nCustomers are responsible for:\n\n• Providing accurate, complete delivery addresses\n• Being available to receive deliveries as scheduled\n• Inspecting deliveries upon receipt\n• Reporting damages or discrepancies within 48 hours`,
          },
          {
            subsection_id: 'risk-of-loss',
            subsection_title: '8.2 Risk of Loss',
            subsection_content: `Risk of loss and title for products pass to the buyer:\n\n• For delivered orders: Upon delivery to the specified address\n• For pickup orders: When customer takes physical possession\n• For freight deliveries: Upon signature at delivery location\n\nBuyers should inspect all shipments immediately upon receipt. Carriers are responsible for in-transit damage. File claims with carrier as needed. BuildEasy facilitates but is not liable for shipping-related losses.`,
          },
          {
            subsection_id: 'inspection',
            subsection_title: '8.3 Inspection and Acceptance',
            subsection_content: `Customers must:\n\n• Inspect all deliveries immediately upon receipt\n• Note any visible damage on carrier delivery receipt\n• Report missing items or damages within 48 hours via Platform\n• Photograph damaged items and packaging for insurance claims\n• Refuse delivery if package appears severely damaged\n\nFailure to report damage within 48 hours may void damage claims. Hidden damage (not visible externally) must be reported within 7 days of delivery with photographic evidence.`,
          },
        ],
      },
      {
        section_id: 'returns-refunds',
        section_number: '9',
        section_title: 'Returns and Refunds',
        section_content: ``,
        subsections: [
          {
            subsection_id: 'return-windows',
            subsection_title: '9.1 Return Windows',
            subsection_content: `• Standard materials: 30-day return window from delivery date\n• Custom-order or cut-to-size items: Non-returnable unless defective\n• Hazardous materials: Non-returnable unless defective (safety regulations)\n• Clearance/final sale items: Non-returnable as marked\n\nReturn window begins from actual delivery date, not order date. Items must be unused, in original packaging, and in resalable condition unless defective or incorrectly shipped.`,
          },
          {
            subsection_id: 'return-conditions',
            subsection_title: '9.2 Return Conditions',
            subsection_content: `To be eligible for return:\n\n• Product must be in original condition and packaging\n• All accessories, manuals, and components included\n• No signs of use, installation, or alteration (unless defective)\n• Return requested through Platform within return window\n• Approved by supplier (except defective items)\n\nDefective items: Returns accepted regardless of condition\nWrong items shipped: Full refund including return shipping\nChange of mind: Customer pays return shipping, may incur 15% restocking fee`,
          },
          {
            subsection_id: 'refund-processing',
            subsection_title: '9.3 Refund Processing',
            subsection_content: `Once return is approved and item received:\n\n• Supplier inspects returned item within 3 business days\n• Refund approved or denied based on condition\n• Approved refunds processed to original payment method within 5-7 business days\n• Partial refunds issued if item damaged or incomplete\n• Customer notified of refund status via email and Platform notification\n\nRefund amount:\n• Defective/wrong item: 100% including original delivery charges\n• Change of mind: Product cost minus return shipping and restocking fee\n• Partial returns: Prorated based on items returned`,
          },
        ],
      },
      {
        section_id: 'fees-payments',
        section_number: '10',
        section_title: 'Fees and Payments',
        section_content: ``,
        subsections: [
          {
            subsection_id: 'commission-structure',
            subsection_title: '10.1 Commission Structure (Suppliers)',
            subsection_content: `Suppliers pay BuildEasy a commission on each completed sale:\n\n• Standard tier: 12% of sale price\n• Premium tier (verified suppliers): 10% of sale price\n• Enterprise tier (high-volume suppliers): 8% of sale price\n\nCommission calculated on product subtotal before delivery charges and taxes. Commission rates may be adjusted with 90-day notice. Custom commission rates available for enterprise suppliers via separate agreement.`,
          },
          {
            subsection_id: 'payment-processing-fees',
            subsection_title: '10.2 Payment Processing Fees',
            subsection_content: `Payment processing fees apply to all transactions:\n\n• Credit/debit cards: 2.9% + $0.30 per transaction\n• PayPal: 3.5% + $0.49 per transaction\n• Digital wallets: 2.5% + $0.30 per transaction\n• Trade credit: No processing fee (approved accounts only)\n\nThese fees are deducted from supplier payouts. International transactions may incur currency conversion fees (1.5%).`,
          },
          {
            subsection_id: 'payout-terms',
            subsection_title: '10.3 Payout Terms (Suppliers)',
            subsection_content: `Supplier payouts processed according to selected schedule:\n\n• Daily payouts: Funds from previous day (minimum $100 balance)\n• Weekly payouts: Every Monday for previous week's sales\n• Monthly payouts: First business day of month for previous month\n\nPayout calculation: Sale price - commission - payment processing fees - refunds/chargebacks\n\nFunds held in reserve for 7 days after delivery to cover potential returns. Chargebacks result in immediate payout reduction. Suppliers must maintain valid bank account information for ACH transfers.`,
          },
        ],
      },
      {
        section_id: 'intellectual-property',
        section_number: '11',
        section_title: 'Intellectual Property',
        section_content: ``,
        subsections: [
          {
            subsection_id: 'platform-ownership',
            subsection_title: '11.1 Platform Content Ownership',
            subsection_content: `BuildEasy owns all intellectual property rights in:\n\n• Platform software, code, and technology\n• BuildEasy trademarks, logos, and branding\n• Platform design, layout, and user interface\n• Original content created by BuildEasy (guides, help articles)\n\nUsers may not copy, modify, distribute, or reverse engineer platform components without express written permission.`,
          },
          {
            subsection_id: 'user-content-license',
            subsection_title: '11.2 User Content License',
            subsection_content: `By posting content (listings, reviews, photos, forum posts), you grant BuildEasy:\n\n• Worldwide, non-exclusive, royalty-free license to use, reproduce, display, and distribute your content\n• Right to sublicense content to third-party platforms for marketing\n• Permission to modify content for formatting or display purposes\n• License continues even after account termination for historical content\n\nYou retain ownership of your content but grant necessary licenses for Platform operation. You may request content removal by contacting support.`,
          },
          {
            subsection_id: 'dmca-procedures',
            subsection_title: '11.3 DMCA and Copyright Procedures',
            subsection_content: `To report copyright infringement, submit DMCA notice to legal@buildeasy.com including:\n\n• Identification of copyrighted work\n• Description of infringing material and its location on Platform\n• Your contact information\n• Statement of good faith belief that use is unauthorized\n• Statement that information is accurate\n• Physical or electronic signature\n\nCounter-notices may be submitted if content was removed in error. We will remove infringing content promptly and may terminate accounts of repeat infringers per DMCA requirements (17 U.S.C. § 512).`,
          },
        ],
      },
      {
        section_id: 'privacy-data',
        section_number: '12',
        section_title: 'Privacy and Data',
        section_content: `Your privacy is important to us. Our data collection, use, and sharing practices are detailed in our Privacy Policy, which is incorporated into these Terms by reference.\n\nBy using BuildEasy, you consent to:\n\n• Collection of personal information as described in Privacy Policy\n• Use of cookies and tracking technologies (see Cookie Policy)\n• Processing of payment information by third-party processors\n• Sharing of information with suppliers for order fulfillment\n• Analytics and platform improvement data collection\n\nYou have rights to access, correct, and delete your personal data as described in our Privacy Policy and as required by applicable data protection laws (GDPR, CCPA).`,
      },
      {
        section_id: 'disclaimers',
        section_number: '13',
        section_title: 'Disclaimers and Limitations of Liability',
        section_content: ``,
        subsections: [
          {
            subsection_id: 'as-is-disclaimer',
            subsection_title: '13.1 "AS IS" Disclaimer',
            subsection_content: `THE PLATFORM AND ALL SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.\n\nBUILDEASY DISCLAIMS ALL WARRANTIES, INCLUDING:\n\n• IMPLIED WARRANTIES OF MERCHANTABILITY\n• FITNESS FOR A PARTICULAR PURPOSE\n• NON-INFRINGEMENT\n• UNINTERRUPTED OR ERROR-FREE OPERATION\n• SECURITY OR VIRUS-FREE OPERATION\n\nWe do not warrant that Platform will meet your requirements or that services will be uninterrupted, timely, secure, or error-free.`,
          },
          {
            subsection_id: 'warranty-disclaimers',
            subsection_title: '13.2 Product and Supplier Warranties',
            subsection_content: `BuildEasy makes no warranties regarding:\n\n• Quality, safety, or legality of products sold by suppliers\n• Accuracy of supplier representations or listings\n• Supplier performance or reliability\n• Delivery timeframes or methods\n• Product fitness for customer's intended use\n\nAny warranties are provided solely by the product manufacturer or supplier, not by BuildEasy. Warranty claims should be directed to the supplier or manufacturer.`,
          },
          {
            subsection_id: 'liability-caps',
            subsection_title: '13.3 Limitation of Liability',
            subsection_content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, BUILDEASY'S TOTAL LIABILITY FOR ALL CLAIMS RELATED TO THE PLATFORM SHALL NOT EXCEED:\n\n• For customers: The amount paid for the transaction giving rise to the claim\n• For suppliers: Total fees paid to BuildEasy in the 12 months preceding the claim\n• In no event more than $1,000 USD\n\nBUILDEASY IS NOT LIABLE FOR:\n\n• INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES\n• LOST PROFITS, REVENUE, OR BUSINESS OPPORTUNITIES\n• LOSS OF DATA OR INFORMATION\n• PERSONAL INJURY OR PROPERTY DAMAGE\n• DAMAGES ARISING FROM THIRD-PARTY ACTIONS\n\nThis limitation applies regardless of legal theory (contract, tort, negligence) and even if BuildEasy was advised of possibility of damages.`,
          },
        ],
      },
      {
        section_id: 'indemnification',
        section_number: '14',
        section_title: 'Indemnification',
        section_content: `You agree to indemnify, defend, and hold harmless BuildEasy, its affiliates, officers, directors, employees, agents, and partners from any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorneys' fees) arising from or relating to:\n\n• Your use of the Platform\n• Your violation of these Terms\n• Your violation of any rights of third parties\n• Your content, listings, or communications on Platform\n• Products you sell (if supplier)\n• Your breach of representations and warranties\n• Any negligent or willful misconduct\n\nThis indemnification obligation survives termination of your account and these Terms. BuildEasy reserves the right to assume exclusive defense and control of any matter subject to indemnification.`,
      },
      {
        section_id: 'dispute-resolution',
        section_number: '15',
        section_title: 'Dispute Resolution',
        section_content: ``,
        subsections: [
          {
            subsection_id: 'platform-disputes',
            subsection_title: '15.1 Platform Dispute Resolution',
            subsection_content: `For disputes between buyers and suppliers regarding transactions:\n\n• Parties must first attempt direct resolution through Platform messaging\n• If unresolved within 7 days, either party may escalate to BuildEasy\n• BuildEasy will mediate dispute and make binding decision within 14 days\n• Decision may include refunds, replacements, or other remedies\n• BuildEasy's decision is final and binding on both parties\n\nEvidence required: Photos of defects, communications between parties, delivery confirmation, product descriptions. BuildEasy may request additional documentation.`,
          },
          {
            subsection_id: 'arbitration',
            subsection_title: '15.2 Arbitration Agreement',
            subsection_content: `IMPORTANT: THIS SECTION AFFECTS YOUR LEGAL RIGHTS\n\nAny dispute with BuildEasy (not between users) must be resolved through binding arbitration, NOT court litigation. By using BuildEasy, you agree to:\n\n• Resolve disputes through individual arbitration administered by American Arbitration Association (AAA)\n• Arbitration conducted under AAA Commercial Arbitration Rules\n• Arbitrator's decision is final and binding\n• Location: Delaware or location mutually agreed\n• Each party bears own attorneys' fees unless arbitrator awards fees\n• Small claims court option available for claims under $10,000\n\nThis arbitration agreement survives termination of your account.`,
          },
          {
            subsection_id: 'class-action-waiver',
            subsection_title: '15.3 Class Action Waiver',
            subsection_content: `YOU AGREE TO BRING CLAIMS ONLY IN YOUR INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION.\n\nThere shall be no right or authority for disputes to be arbitrated or litigated on a class action basis. If this class action waiver is found unenforceable, the arbitration agreement is void.`,
          },
          {
            subsection_id: 'governing-law',
            subsection_title: '15.4 Governing Law',
            subsection_content: `These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles. Federal laws of the United States also apply where relevant.\n\nJurisdiction and venue for any disputes not subject to arbitration shall be exclusively in state and federal courts located in Delaware. You consent to personal jurisdiction in these courts.`,
          },
        ],
      },
      {
        section_id: 'termination',
        section_number: '16',
        section_title: 'Account Termination',
        section_content: ``,
        subsections: [
          {
            subsection_id: 'termination-by-buildeasy',
            subsection_title: '16.1 Termination by BuildEasy',
            subsection_content: `BuildEasy may suspend or terminate your account:\n\n• Immediately for material breach of these Terms\n• For fraudulent activity or suspected fraud\n• For repeated Terms violations\n• For non-payment of fees (suppliers)\n• For legal or regulatory requirements\n• At our discretion with 30-day notice for convenience\n\nUpon termination:\n• Access to Platform immediately revoked\n• Active orders may be completed or canceled\n• Suppliers: Outstanding payouts processed (minus applicable fees/chargebacks)\n• Customer refunds for pending orders processed\n• Account data retained per Privacy Policy and legal requirements`,
          },
          {
            subsection_id: 'termination-by-user',
            subsection_title: '16.2 Termination by User',
            subsection_content: `You may terminate your account:\n\n• At any time through account settings\n• 30-day notice required for supplier accounts with active listings\n• All pending orders must be fulfilled or canceled before termination\n• Data deletion requested after 90-day grace period\n• Reviews and forum posts may remain (anonymized)\n\nTo delete account:\n1. Fulfill or cancel all active orders\n2. Withdraw available funds (suppliers)\n3. Submit deletion request via Account Settings\n4. Confirm via email verification\n5. 30-day grace period before permanent deletion`,
          },
          {
            subsection_id: 'post-termination',
            subsection_title: '16.3 Effect of Termination',
            subsection_content: `Termination does not affect:\n\n• Rights and obligations accrued before termination\n• Indemnification obligations (survive indefinitely)\n• Arbitration agreement (survives termination)\n• Limitation of liability (survives termination)\n• Any amounts owed to BuildEasy\n\nHistorical transaction data maintained for legal compliance (tax, fraud prevention). Personal data deleted per Privacy Policy unless legal retention required.`,
          },
        ],
      },
      {
        section_id: 'modifications',
        section_number: '17',
        section_title: 'Modifications to Terms',
        section_content: `BuildEasy reserves the right to modify these Terms at any time. When we make material changes:\n\n• Updated Terms posted on this page with new "Last Updated" date\n• Registered users notified via email at least 30 days before effective date\n• Continued use after effective date constitutes acceptance of updated Terms\n• If you disagree with changes, you must stop using Platform and may terminate account\n\nNon-material changes (typos, clarifications, minor updates) may be made without notice. We encourage you to review Terms periodically. Material changes affecting payment terms, liability, or user rights require express acceptance on next login.`,
      },
      {
        section_id: 'miscellaneous',
        section_number: '18',
        section_title: 'Miscellaneous Provisions',
        section_content: ``,
        subsections: [
          {
            subsection_id: 'severability',
            subsection_title: '18.1 Severability',
            subsection_content: `If any provision of these Terms is found invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. Invalid provisions shall be modified to the minimum extent necessary to make them valid and enforceable.`,
          },
          {
            subsection_id: 'entire-agreement',
            subsection_title: '18.2 Entire Agreement',
            subsection_content: `These Terms, together with Privacy Policy and Cookie Policy, constitute the entire agreement between you and BuildEasy regarding Platform use. They supersede all prior or contemporaneous communications and proposals, whether oral or written.\n\nNo waiver of any Term shall be deemed a further or continuing waiver. Our failure to enforce any right or provision shall not constitute a waiver of such right or provision.`,
          },
          {
            subsection_id: 'force-majeure',
            subsection_title: '18.3 Force Majeure',
            subsection_content: `BuildEasy is not liable for delays or failures in performance resulting from causes beyond reasonable control, including:\n\n• Acts of God (earthquakes, floods, fires)\n• War, terrorism, civil unrest\n• Government actions, regulations, or embargoes\n• Internet or telecommunications failures\n• Power outages or infrastructure failures\n• Labor strikes or disputes\n• Pandemics or public health emergencies\n\nPlatform functionality may be limited during force majeure events. We will make reasonable efforts to resume normal operations.`,
          },
          {
            subsection_id: 'assignment',
            subsection_title: '18.4 Assignment',
            subsection_content: `You may not assign or transfer your rights or obligations under these Terms without BuildEasy's prior written consent. BuildEasy may assign these Terms or rights hereunder without restriction, including in connection with merger, acquisition, or sale of assets.`,
          },
          {
            subsection_id: 'contact',
            subsection_title: '18.5 Contact Information',
            subsection_content: `For questions about these Terms, contact us at:\n\nBuildEasy Legal Department\nEmail: legal@buildeasy.com\nPhone: 1-800-BUILD-EASY\n\nWritten notices should be sent via certified mail. Email notices are acceptable for general inquiries but not formal legal notices.`,
          },
        ],
      },
    ],
  };

  // Generate table of contents
  const tableOfContents: TOCItem[] = termsContent.sections.map(section => ({
    section_id: section.section_id,
    section_title: `${section.section_number}. ${section.section_title}`,
    anchor: `#${section.section_id}`,
  }));

  // ========================================================================
  // Effects
  // ========================================================================
  
  // Scroll detection for active section and back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setShowBackToTop(position > 400);

      // Detect active section in viewport
      const sectionEntries = Object.entries(sectionRefs.current);
      for (const [sectionId, element] of sectionEntries) {
        if (element) {
          const rect = element.getBoundingClientRect();
          // Section is active if it's near the top of viewport
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle URL hash navigation on mount
  useEffect(() => {
    if (window.location.hash) {
      const sectionId = window.location.hash.substring(1);
      // Delay scroll to allow rendering
      setTimeout(() => scrollToSection(sectionId), 300);
    }
  }, []);

  // ========================================================================
  // Action Handlers
  // ========================================================================
  
  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const yOffset = -100; // Offset for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      window.history.replaceState(null, '', `#${sectionId}`);
      setActiveSection(sectionId);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = () => {
    window.print();
  };

  // ========================================================================
  // Render
  // ========================================================================
  
  return (
    <>
      {/* Page Container */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 print:shadow-none print:border-b-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  {termsContent.document_title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                  <span className="flex items-center">
                    <strong className="mr-2">Last Updated:</strong> 
                    {termsContent.last_updated}
                  </span>
                  <span className="hidden sm:inline text-gray-300">|</span>
                  <span className="flex items-center">
                    <strong className="mr-2">Effective Date:</strong> 
                    {termsContent.effective_date}
                  </span>
                </div>
              </div>
              <button
                onClick={handlePrint}
                className="flex items-center justify-center space-x-2 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 print:hidden"
                aria-label="Print Terms of Service"
              >
                <Printer className="w-5 h-5" />
                <span className="font-medium">Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Table of Contents - Desktop Sidebar */}
            <aside className="hidden lg:block lg:col-span-1 print:hidden">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Contents
                </h2>
                <nav className="space-y-1" aria-label="Table of contents">
                  {tableOfContents.map((item) => (
                    <button
                      key={item.section_id}
                      onClick={() => scrollToSection(item.section_id)}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        activeSection === item.section_id
                          ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      aria-current={activeSection === item.section_id ? 'true' : 'false'}
                    >
                      {item.section_title}
                    </button>
                  ))}
                </nav>

                {/* Related Documents */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Related Documents
                  </p>
                  <Link
                    to="/privacy"
                    className="block text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Privacy Policy →
                  </Link>
                  <Link
                    to="/cookies"
                    className="block text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Cookie Policy →
                  </Link>
                  <Link
                    to="/help"
                    className="block text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Help Center →
                  </Link>
                </div>
              </div>
            </aside>

            {/* Terms Content */}
            <div className="lg:col-span-3">
              <article className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-10 lg:p-12">
                {/* Print-only header */}
                <div className="hidden print:block mb-8 pb-6 border-b-2 border-gray-300">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {termsContent.document_title}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Last Updated: {termsContent.last_updated} | Effective Date: {termsContent.effective_date}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Printed from buildeasy.com/terms
                  </p>
                </div>

                {/* Introduction Paragraph */}
                <div className="mb-12 pb-8 border-b border-gray-200">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Please read these Terms of Service carefully before using the BuildEasy platform. 
                    By accessing or using our services, you agree to be bound by these Terms. 
                    If you disagree with any part of the Terms, you may not access the Platform.
                  </p>
                </div>

                {/* Terms Sections */}
                <div className="space-y-12">
                  {termsContent.sections.map((section) => (
                    <section
                      key={section.section_id}
                      id={section.section_id}
                      ref={(el) => (sectionRefs.current[section.section_id] = el)}
                      className="scroll-mt-24 print:break-inside-avoid"
                    >
                      {/* Section Title */}
                      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                        {section.section_number}. {section.section_title}
                      </h2>

                      {/* Section Content */}
                      {section.section_content && (
                        <div className="mb-6">
                          {section.section_content.split('\n\n').map((paragraph, idx) => {
                            // Check if paragraph contains bullet points
                            if (paragraph.includes('\n•')) {
                              const [intro, ...bulletItems] = paragraph.split('\n');
                              return (
                                <div key={idx} className="mb-4">
                                  {intro && (
                                    <p className="text-base text-gray-700 leading-relaxed mb-3">
                                      {intro}
                                    </p>
                                  )}
                                  <ul className="list-none space-y-2 ml-4">
                                    {bulletItems.map((item, itemIdx) => {
                                      const cleanItem = item.replace('•', '').trim();
                                      return cleanItem ? (
                                        <li key={itemIdx} className="flex items-start text-gray-700">
                                          <span className="text-blue-600 mr-3 mt-1 flex-shrink-0">•</span>
                                          <span className="leading-relaxed">{cleanItem}</span>
                                        </li>
                                      ) : null;
                                    })}
                                  </ul>
                                </div>
                              );
                            }
                            
                            return (
                              <p key={idx} className="text-base text-gray-700 leading-relaxed mb-4">
                                {paragraph.split('\n').map((line, lineIdx) => (
                                  <React.Fragment key={lineIdx}>
                                    {line}
                                    {lineIdx < paragraph.split('\n').length - 1 && <br />}
                                  </React.Fragment>
                                ))}
                              </p>
                            );
                          })}
                        </div>
                      )}

                      {/* Subsections */}
                      {section.subsections && section.subsections.length > 0 && (
                        <div className="space-y-8 ml-0 sm:ml-6">
                          {section.subsections.map((subsection) => (
                            <div
                              key={subsection.subsection_id}
                              id={subsection.subsection_id}
                              className="scroll-mt-24 print:break-inside-avoid"
                            >
                              <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
                                {subsection.subsection_title}
                              </h3>
                              <div className="space-y-3">
                                {subsection.subsection_content.split('\n\n').map((paragraph, idx) => {
                                  // Handle bullet points
                                  if (paragraph.includes('\n•')) {
                                    const [intro, ...bulletItems] = paragraph.split('\n');
                                    return (
                                      <div key={idx}>
                                        {intro && intro.trim() && (
                                          <p className="text-base text-gray-700 leading-relaxed mb-3">
                                            {intro}
                                          </p>
                                        )}
                                        <ul className="list-none space-y-2 ml-4">
                                          {bulletItems.map((item, itemIdx) => {
                                            const cleanItem = item.replace('•', '').trim();
                                            return cleanItem ? (
                                              <li key={itemIdx} className="flex items-start text-gray-700">
                                                <span className="text-blue-600 mr-3 mt-1 flex-shrink-0">•</span>
                                                <span className="leading-relaxed">{cleanItem}</span>
                                              </li>
                                            ) : null;
                                          })}
                                        </ul>
                                      </div>
                                    );
                                  }
                                  
                                  return (
                                    <p key={idx} className="text-base text-gray-700 leading-relaxed">
                                      {paragraph.split('\n').map((line, lineIdx) => (
                                        <React.Fragment key={lineIdx}>
                                          {line}
                                          {lineIdx < paragraph.split('\n').length - 1 && <br />}
                                        </React.Fragment>
                                      ))}
                                    </p>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  ))}
                </div>

                {/* Footer Information */}
                <div className="mt-16 pt-8 border-t-2 border-gray-200 print:break-inside-avoid">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      Questions About These Terms?
                    </h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      If you have any questions about these Terms of Service, please contact our legal team:
                    </p>
                    <div className="space-y-2 text-gray-700">
                      <p className="flex items-center">
                        <strong className="mr-2">Email:</strong>
                        <a 
                          href="mailto:legal@buildeasy.com" 
                          className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          legal@buildeasy.com
                        </a>
                      </p>
                      <p className="flex items-center">
                        <strong className="mr-2">Phone:</strong>
                        <a 
                          href="tel:1-800-BUILD-EASY" 
                          className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          1-800-BUILD-EASY
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Related Documents Links */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      to="/privacy"
                      className="inline-flex items-center px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                      Privacy Policy
                    </Link>
                    <Link
                      to="/cookies"
                      className="inline-flex items-center px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                      Cookie Policy
                    </Link>
                    <Link
                      to="/accessibility"
                      className="inline-flex items-center px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                      Accessibility
                    </Link>
                    <Link
                      to="/help"
                      className="inline-flex items-center px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                      Help Center
                    </Link>
                  </div>

                  {/* Version History & Additional Info */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Version history available upon request. Previous versions maintained for reference in case of disputes. 
                      For legal notices regarding these Terms, written communication should be sent via certified mail to our registered office.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      These Terms are available in English. Translations may be provided for convenience but English version controls in case of discrepancies.
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>

        {/* Back to Top Button */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-all duration-200 hover:scale-110 hover:shadow-blue-200 z-50 print:hidden focus:outline-none focus:ring-4 focus:ring-blue-200"
            aria-label="Scroll back to top"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        )}

        {/* Mobile Table of Contents Toggle */}
        <div className="lg:hidden fixed bottom-8 left-8 print:hidden z-50">
          <button
            onClick={() => setMobileTocOpen(!mobileTocOpen)}
            className="bg-white text-gray-700 p-4 rounded-full shadow-2xl border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100"
            aria-label="Toggle table of contents"
            aria-expanded={mobileTocOpen}
          >
            <FileText className="w-6 h-6" />
          </button>
          
          {/* Mobile TOC Dropdown */}
          {mobileTocOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setMobileTocOpen(false)}
                aria-hidden="true"
              />
              
              {/* TOC Panel */}
              <div
                className="fixed bottom-24 left-4 right-4 bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-6 max-h-96 overflow-y-auto z-50"
                role="dialog"
                aria-label="Table of contents"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-lg">Table of Contents</h3>
                  <button
                    onClick={() => setMobileTocOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close table of contents"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <nav className="space-y-1">
                  {tableOfContents.map((item) => (
                    <button
                      key={item.section_id}
                      onClick={() => {
                        scrollToSection(item.section_id);
                        setMobileTocOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        activeSection === item.section_id
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {item.section_title}
                    </button>
                  ))}
                </nav>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
          }
          
          @page {
            margin: 1in;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:block {
            display: block !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:border-b-2 {
            border-bottom-width: 2px !important;
          }
          
          .print\\:break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          h1, h2, h3 {
            page-break-after: avoid;
            break-after: avoid;
          }
          
          section {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          a {
            color: #000;
            text-decoration: underline;
          }
          
          a[href]:after {
            content: " (" attr(href) ")";
            font-size: 0.8em;
            color: #666;
          }
        }
      `}</style>
    </>
  );
};

export default UV_TermsOfService;