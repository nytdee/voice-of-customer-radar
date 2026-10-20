import { parseCsv } from "./csv";

export const SAMPLE_REVIEWS_CSV = `review_id,review_date,product,platform,rating,review_text,product_url,data_origin
SYN-0001,2026-10-07,Aero Cabin Case,Myntra (simulated),2,The pull handle feels loose and the wheels do not roll smoothly.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0002,2026-10-11,Aero Cabin Case,Myntra (simulated),1,A wheel came loose during use; the handle also feels unstable.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0003,2026-10-10,Aero Cabin Case,Blinkit (simulated),2,One wheel started wobbling after two trips and the handle sticks when extended.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0004,2026-10-11,Aero Cabin Case,Blinkit (simulated),3,One wheel started wobbling after two trips and the handle sticks when extended.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0005,2026-10-07,Aero Cabin Case,Zepto (simulated),3,A wheel came loose during use; the handle also feels unstable.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0006,2026-10-12,Aero Cabin Case,Blinkit (simulated),2,The pull handle feels loose and the wheels do not roll smoothly.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0007,2026-10-07,Aero Cabin Case,Blinkit (simulated),1,The pull handle feels loose and the wheels do not roll smoothly.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0008,2026-10-12,Aero Cabin Case,Blinkit (simulated),3,The pull handle feels loose and the wheels do not roll smoothly.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0009,2026-10-18,Aero Cabin Case,Myntra (simulated),2,A wheel came loose during use; the handle also feels unstable.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0010,2026-10-14,Aero Cabin Case,Zepto (simulated),2,One wheel started wobbling after two trips and the handle sticks when extended.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0011,2026-10-19,Aero Cabin Case,Myntra (simulated),3,A wheel came loose during use; the handle also feels unstable.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0012,2026-10-13,Aero Cabin Case,Zepto (simulated),3,One wheel started wobbling after two trips and the handle sticks when extended.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0013,2026-10-18,Aero Cabin Case,Flipkart (simulated),2,The pull handle feels loose and the wheels do not roll smoothly.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0014,2026-10-15,Aero Cabin Case,Flipkart (simulated),3,A wheel came loose during use; the handle also feels unstable.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0015,2026-10-19,Aero Cabin Case,Flipkart (simulated),2,The pull handle feels loose and the wheels do not roll smoothly.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0016,2026-10-15,Aero Cabin Case,Amazon India (simulated),2,The pull handle feels loose and the wheels do not roll smoothly.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0017,2026-10-16,Aero Cabin Case,Blinkit (simulated),3,The pull handle feels loose and the wheels do not roll smoothly.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0018,2026-10-19,Aero Cabin Case,Myntra (simulated),2,One wheel started wobbling after two trips and the handle sticks when extended.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0019,2026-10-16,Aero Cabin Case,Zepto (simulated),2,One wheel started wobbling after two trips and the handle sticks when extended.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0020,2026-10-08,Aero Cabin Case,Flipkart (simulated),2,"Zip jammed twice on the first trip, which is disappointing.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0021,2026-10-09,Aero Cabin Case,Myntra (simulated),2,The main zipper failed after a few uses and no longer closes reliably.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0022,2026-10-06,Aero Cabin Case,Myntra (simulated),1,"Zip jammed twice on the first trip, which is disappointing.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0023,2026-10-12,Aero Cabin Case,Zepto (simulated),2,"Zip jammed twice on the first trip, which is disappointing.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0024,2026-10-07,Aero Cabin Case,Blinkit (simulated),1,The main zipper failed after a few uses and no longer closes reliably.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0025,2026-10-10,Aero Cabin Case,Zepto (simulated),2,The zipper gets stuck around the corner and takes effort to close.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0026,2026-10-17,Aero Cabin Case,Blinkit (simulated),2,"Zip jammed twice on the first trip, which is disappointing.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0027,2026-10-15,Aero Cabin Case,Amazon India (simulated),3,The zipper gets stuck around the corner and takes effort to close.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0028,2026-10-15,Aero Cabin Case,Flipkart (simulated),1,The main zipper failed after a few uses and no longer closes reliably.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0029,2026-10-14,Aero Cabin Case,Amazon India (simulated),2,The zipper gets stuck around the corner and takes effort to close.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0030,2026-10-15,Aero Cabin Case,Blinkit (simulated),2,"Zip jammed twice on the first trip, which is disappointing.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0031,2026-10-19,Aero Cabin Case,Myntra (simulated),1,"Zip jammed twice on the first trip, which is disappointing.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0032,2026-10-19,Aero Cabin Case,Flipkart (simulated),2,The main zipper failed after a few uses and no longer closes reliably.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0033,2026-10-18,Aero Cabin Case,Myntra (simulated),3,The main zipper failed after a few uses and no longer closes reliably.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0034,2026-10-13,Aero Cabin Case,Myntra (simulated),3,The zipper gets stuck around the corner and takes effort to close.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0035,2026-10-11,Aero Cabin Case,Amazon India (simulated),1,Visible scuffs appeared quickly and the surface scratches too easily.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0036,2026-10-11,Aero Cabin Case,Blinkit (simulated),1,The case arrived with a dent near the corner and marks on the shell.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0037,2026-10-06,Aero Cabin Case,Flipkart (simulated),2,The case arrived with a dent near the corner and marks on the shell.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0038,2026-10-10,Aero Cabin Case,Amazon India (simulated),3,The case arrived with a dent near the corner and marks on the shell.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0039,2026-10-16,Aero Cabin Case,Zepto (simulated),1,Visible scuffs appeared quickly and the surface scratches too easily.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0040,2026-10-18,Aero Cabin Case,Blinkit (simulated),3,Visible scuffs appeared quickly and the surface scratches too easily.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0041,2026-10-14,Aero Cabin Case,Flipkart (simulated),2,The case arrived with a dent near the corner and marks on the shell.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0042,2026-10-14,Aero Cabin Case,Zepto (simulated),2,The case arrived with a dent near the corner and marks on the shell.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0043,2026-10-19,Aero Cabin Case,Amazon India (simulated),3,Visible scuffs appeared quickly and the surface scratches too easily.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0044,2026-10-15,Aero Cabin Case,Amazon India (simulated),2,The shell arrived scratched and the finish looks cheaper than the photos.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0045,2026-10-16,Aero Cabin Case,Amazon India (simulated),2,The shell arrived scratched and the finish looks cheaper than the photos.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0046,2026-10-12,Aero Cabin Case,Amazon India (simulated),5,Looks great and has been working well so far.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0047,2026-10-11,Aero Cabin Case,Zepto (simulated),4,Good quality for everyday use and the finish looks premium.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0048,2026-10-11,Aero Cabin Case,Amazon India (simulated),5,Delivery was smooth and the product matched the description.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0049,2026-10-08,Aero Cabin Case,Zepto (simulated),5,Good quality for everyday use and the finish looks premium.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0050,2026-10-11,Aero Cabin Case,Zepto (simulated),5,Very happy with the purchase; useful design and good capacity.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0051,2026-10-19,Aero Cabin Case,Myntra (simulated),5,Looks great and has been working well so far.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0052,2026-10-14,Aero Cabin Case,Blinkit (simulated),4,Very happy with the purchase; useful design and good capacity.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0053,2026-10-18,Aero Cabin Case,Myntra (simulated),4,Very happy with the purchase; useful design and good capacity.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0054,2026-10-15,Aero Cabin Case,Myntra (simulated),4,"Solid build, thoughtful pockets and good value for my needs.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0055,2026-10-16,Aero Cabin Case,Amazon India (simulated),5,Very happy with the purchase; useful design and good capacity.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0056,2026-10-08,Aero Cabin Case,Amazon India (simulated),3,"The size is acceptable, though the product photos could explain dimensions better.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0057,2026-10-06,Aero Cabin Case,Amazon India (simulated),3,"The size is acceptable, though the product photos could explain dimensions better.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0058,2026-10-13,Aero Cabin Case,Flipkart (simulated),3,"Product is okay overall, but I expected a little more at this price.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0059,2026-10-13,Aero Cabin Case,Zepto (simulated),3,Looks fine so far; I need more time to judge long-term durability.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0060,2026-10-08,Nomad Work Backpack,Amazon India (simulated),1,The laptop compartment does not fit the size stated on the product page.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0061,2026-10-07,Nomad Work Backpack,Zepto (simulated),1,The advertised capacity is misleading; my charger and notebook barely fit.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0062,2026-10-07,Nomad Work Backpack,Zepto (simulated),2,The laptop compartment does not fit the size stated on the product page.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0063,2026-10-09,Nomad Work Backpack,Zepto (simulated),3,The laptop sleeve is too small for my 16-inch laptop and the compartment is tight.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0064,2026-10-09,Nomad Work Backpack,Blinkit (simulated),2,The advertised capacity is misleading; my charger and notebook barely fit.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0065,2026-10-06,Nomad Work Backpack,Zepto (simulated),2,The laptop compartment does not fit the size stated on the product page.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0066,2026-10-11,Nomad Work Backpack,Zepto (simulated),3,The laptop compartment does not fit the size stated on the product page.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0067,2026-10-11,Nomad Work Backpack,Myntra (simulated),2,The laptop sleeve is too small for my 16-inch laptop and the compartment is tight.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0068,2026-10-17,Nomad Work Backpack,Flipkart (simulated),2,The advertised capacity is misleading; my charger and notebook barely fit.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0069,2026-10-16,Nomad Work Backpack,Myntra (simulated),2,The laptop sleeve is too small for my 16-inch laptop and the compartment is tight.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0070,2026-10-13,Nomad Work Backpack,Zepto (simulated),1,The advertised capacity is misleading; my charger and notebook barely fit.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0071,2026-10-15,Nomad Work Backpack,Amazon India (simulated),1,The advertised capacity is misleading; my charger and notebook barely fit.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0072,2026-10-13,Nomad Work Backpack,Myntra (simulated),2,The laptop sleeve is too small for my 16-inch laptop and the compartment is tight.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0073,2026-10-19,Nomad Work Backpack,Flipkart (simulated),1,The advertised capacity is misleading; my charger and notebook barely fit.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0074,2026-10-15,Nomad Work Backpack,Zepto (simulated),2,The advertised capacity is misleading; my charger and notebook barely fit.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0075,2026-10-15,Nomad Work Backpack,Myntra (simulated),3,The laptop compartment does not fit the size stated on the product page.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0076,2026-10-19,Nomad Work Backpack,Amazon India (simulated),3,The advertised capacity is misleading; my charger and notebook barely fit.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0077,2026-10-14,Nomad Work Backpack,Flipkart (simulated),1,The laptop compartment does not fit the size stated on the product page.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0078,2026-10-17,Nomad Work Backpack,Flipkart (simulated),2,The laptop sleeve is too small for my 16-inch laptop and the compartment is tight.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0079,2026-10-07,Nomad Work Backpack,Flipkart (simulated),2,The shoulder straps are uncomfortable when the bag is fully loaded.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0080,2026-10-06,Nomad Work Backpack,Blinkit (simulated),2,The padding is thin and the backpack feels heavy on my shoulders.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0081,2026-10-07,Nomad Work Backpack,Amazon India (simulated),1,Straps dig into my shoulders after a short commute.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0082,2026-10-12,Nomad Work Backpack,Amazon India (simulated),2,The shoulder straps are uncomfortable when the bag is fully loaded.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0083,2026-10-11,Nomad Work Backpack,Flipkart (simulated),3,The shoulder straps are uncomfortable when the bag is fully loaded.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0084,2026-10-12,Nomad Work Backpack,Blinkit (simulated),2,Straps dig into my shoulders after a short commute.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0085,2026-10-14,Nomad Work Backpack,Myntra (simulated),3,Straps dig into my shoulders after a short commute.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0086,2026-10-15,Nomad Work Backpack,Flipkart (simulated),1,The padding is thin and the backpack feels heavy on my shoulders.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0087,2026-10-16,Nomad Work Backpack,Myntra (simulated),2,Straps dig into my shoulders after a short commute.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0088,2026-10-14,Nomad Work Backpack,Myntra (simulated),2,The padding is thin and the backpack feels heavy on my shoulders.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0089,2026-10-18,Nomad Work Backpack,Zepto (simulated),2,The padding is thin and the backpack feels heavy on my shoulders.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0090,2026-10-15,Nomad Work Backpack,Blinkit (simulated),1,Straps dig into my shoulders after a short commute.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0091,2026-10-16,Nomad Work Backpack,Zepto (simulated),2,The padding is thin and the backpack feels heavy on my shoulders.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0092,2026-10-17,Nomad Work Backpack,Flipkart (simulated),2,The shoulder straps are uncomfortable when the bag is fully loaded.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0093,2026-10-19,Nomad Work Backpack,Blinkit (simulated),1,The shoulder straps are uncomfortable when the bag is fully loaded.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0094,2026-10-06,Nomad Work Backpack,Myntra (simulated),2,A zipper broke after several days and I cannot close the pocket.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0095,2026-10-08,Nomad Work Backpack,Blinkit (simulated),2,A zipper broke after several days and I cannot close the pocket.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0096,2026-10-07,Nomad Work Backpack,Myntra (simulated),1,The front zipper gets stuck and the pull tab feels flimsy.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0097,2026-10-12,Nomad Work Backpack,Amazon India (simulated),3,A zipper broke after several days and I cannot close the pocket.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0098,2026-10-18,Nomad Work Backpack,Zepto (simulated),2,The zip keeps jamming around the laptop section.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0099,2026-10-19,Nomad Work Backpack,Amazon India (simulated),3,The zip keeps jamming around the laptop section.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0100,2026-10-14,Nomad Work Backpack,Zepto (simulated),1,The zip keeps jamming around the laptop section.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0101,2026-10-16,Nomad Work Backpack,Amazon India (simulated),3,A zipper broke after several days and I cannot close the pocket.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0102,2026-10-14,Nomad Work Backpack,Blinkit (simulated),2,The front zipper gets stuck and the pull tab feels flimsy.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0103,2026-10-13,Nomad Work Backpack,Blinkit (simulated),2,The zip keeps jamming around the laptop section.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0104,2026-10-16,Nomad Work Backpack,Myntra (simulated),2,A zipper broke after several days and I cannot close the pocket.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0105,2026-10-08,Nomad Work Backpack,Amazon India (simulated),4,Looks great and has been working well so far.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0106,2026-10-12,Nomad Work Backpack,Amazon India (simulated),5,"Solid build, thoughtful pockets and good value for my needs.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0107,2026-10-11,Nomad Work Backpack,Amazon India (simulated),5,Very happy with the purchase; useful design and good capacity.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0108,2026-10-07,Nomad Work Backpack,Zepto (simulated),5,Good quality for everyday use and the finish looks premium.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0109,2026-10-08,Nomad Work Backpack,Flipkart (simulated),5,Delivery was smooth and the product matched the description.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0110,2026-10-13,Nomad Work Backpack,Flipkart (simulated),4,Delivery was smooth and the product matched the description.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0111,2026-10-14,Nomad Work Backpack,Flipkart (simulated),5,Good quality for everyday use and the finish looks premium.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0112,2026-10-13,Nomad Work Backpack,Zepto (simulated),5,"Solid build, thoughtful pockets and good value for my needs.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0113,2026-10-16,Nomad Work Backpack,Amazon India (simulated),4,Delivery was smooth and the product matched the description.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0114,2026-10-16,Nomad Work Backpack,Flipkart (simulated),4,"Solid build, thoughtful pockets and good value for my needs.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0115,2026-10-07,Nomad Work Backpack,Myntra (simulated),3,"Product is okay overall, but I expected a little more at this price.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0116,2026-10-10,Nomad Work Backpack,Blinkit (simulated),3,"The size is acceptable, though the product photos could explain dimensions better.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0117,2026-10-15,Nomad Work Backpack,Blinkit (simulated),3,"Product is okay overall, but I expected a little more at this price.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0118,2026-10-16,Nomad Work Backpack,Blinkit (simulated),3,Looks fine so far; I need more time to judge long-term durability.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0119,2026-10-08,Daytrip Tote,Flipkart (simulated),2,Loose stitching near the handle started coming apart after a week.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0120,2026-10-10,Daytrip Tote,Zepto (simulated),2,Threads came loose around the inner pocket; stitching needs improvement.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0121,2026-10-11,Daytrip Tote,Amazon India (simulated),2,Loose stitching near the handle started coming apart after a week.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0122,2026-10-10,Daytrip Tote,Zepto (simulated),2,Threads came loose around the inner pocket; stitching needs improvement.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0123,2026-10-09,Daytrip Tote,Flipkart (simulated),3,The seam is opening where the strap joins the bag.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0124,2026-10-11,Daytrip Tote,Amazon India (simulated),2,Threads came loose around the inner pocket; stitching needs improvement.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0125,2026-10-09,Daytrip Tote,Blinkit (simulated),2,The seam is opening where the strap joins the bag.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0126,2026-10-07,Daytrip Tote,Amazon India (simulated),2,Threads came loose around the inner pocket; stitching needs improvement.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0127,2026-10-19,Daytrip Tote,Blinkit (simulated),2,Threads came loose around the inner pocket; stitching needs improvement.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0128,2026-10-14,Daytrip Tote,Amazon India (simulated),3,The seam is opening where the strap joins the bag.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0129,2026-10-19,Daytrip Tote,Myntra (simulated),2,Loose stitching near the handle started coming apart after a week.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0130,2026-10-18,Daytrip Tote,Blinkit (simulated),2,Threads came loose around the inner pocket; stitching needs improvement.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0131,2026-10-13,Daytrip Tote,Zepto (simulated),3,The seam is opening where the strap joins the bag.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0132,2026-10-14,Daytrip Tote,Blinkit (simulated),2,The seam is opening where the strap joins the bag.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0133,2026-10-13,Daytrip Tote,Zepto (simulated),3,Threads came loose around the inner pocket; stitching needs improvement.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0134,2026-10-14,Daytrip Tote,Blinkit (simulated),2,Threads came loose around the inner pocket; stitching needs improvement.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0135,2026-10-18,Daytrip Tote,Amazon India (simulated),2,The seam is opening where the strap joins the bag.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0136,2026-10-18,Daytrip Tote,Zepto (simulated),2,Threads came loose around the inner pocket; stitching needs improvement.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0137,2026-10-16,Daytrip Tote,Amazon India (simulated),2,Threads came loose around the inner pocket; stitching needs improvement.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0138,2026-10-10,Daytrip Tote,Myntra (simulated),2,The product colour is noticeably different from what I expected online.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0139,2026-10-09,Daytrip Tote,Myntra (simulated),3,The colour looks different from the photos and is much duller in person.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0140,2026-10-06,Daytrip Tote,Amazon India (simulated),2,The actual shade is not as pictured on the listing.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0141,2026-10-11,Daytrip Tote,Blinkit (simulated),3,The colour looks different from the photos and is much duller in person.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0142,2026-10-12,Daytrip Tote,Amazon India (simulated),3,The colour looks different from the photos and is much duller in person.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0143,2026-10-06,Daytrip Tote,Myntra (simulated),1,The actual shade is not as pictured on the listing.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0144,2026-10-13,Daytrip Tote,Blinkit (simulated),1,The colour looks different from the photos and is much duller in person.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0145,2026-10-19,Daytrip Tote,Amazon India (simulated),2,The colour looks different from the photos and is much duller in person.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0146,2026-10-18,Daytrip Tote,Blinkit (simulated),2,The product colour is noticeably different from what I expected online.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0147,2026-10-16,Daytrip Tote,Zepto (simulated),2,The product colour is noticeably different from what I expected online.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0148,2026-10-19,Daytrip Tote,Zepto (simulated),2,The actual shade is not as pictured on the listing.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0149,2026-10-13,Daytrip Tote,Zepto (simulated),1,The actual shade is not as pictured on the listing.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0150,2026-10-19,Daytrip Tote,Flipkart (simulated),2,The product colour is noticeably different from what I expected online.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0151,2026-10-18,Daytrip Tote,Zepto (simulated),2,The actual shade is not as pictured on the listing.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0152,2026-10-14,Daytrip Tote,Amazon India (simulated),1,The colour looks different from the photos and is much duller in person.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0153,2026-10-09,Daytrip Tote,Blinkit (simulated),3,The tote arrived crushed in thin packaging and has crease marks.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0154,2026-10-06,Daytrip Tote,Amazon India (simulated),1,Packaging offered little protection; the tote arrived with marks.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0155,2026-10-07,Daytrip Tote,Zepto (simulated),2,Packaging offered little protection; the tote arrived with marks.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0156,2026-10-07,Daytrip Tote,Amazon India (simulated),3,The tote arrived crushed in thin packaging and has crease marks.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0157,2026-10-15,Daytrip Tote,Myntra (simulated),2,Packaging offered little protection; the tote arrived with marks.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0158,2026-10-14,Daytrip Tote,Zepto (simulated),2,The tote arrived crushed in thin packaging and has crease marks.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0159,2026-10-18,Daytrip Tote,Amazon India (simulated),2,The tote arrived crushed in thin packaging and has crease marks.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0160,2026-10-17,Daytrip Tote,Amazon India (simulated),1,The tote arrived crushed in thin packaging and has crease marks.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0161,2026-10-14,Daytrip Tote,Flipkart (simulated),2,Packaging offered little protection; the tote arrived with marks.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0162,2026-10-18,Daytrip Tote,Amazon India (simulated),2,The box was damaged in transit and the bag was folded badly inside.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0163,2026-10-19,Daytrip Tote,Amazon India (simulated),1,The tote arrived crushed in thin packaging and has crease marks.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0164,2026-10-08,Daytrip Tote,Flipkart (simulated),4,Good quality for everyday use and the finish looks premium.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0165,2026-10-10,Daytrip Tote,Amazon India (simulated),4,Good quality for everyday use and the finish looks premium.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0166,2026-10-10,Daytrip Tote,Blinkit (simulated),5,"Solid build, thoughtful pockets and good value for my needs.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0167,2026-10-11,Daytrip Tote,Myntra (simulated),5,"Solid build, thoughtful pockets and good value for my needs.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0168,2026-10-09,Daytrip Tote,Blinkit (simulated),5,"Solid build, thoughtful pockets and good value for my needs.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0169,2026-10-18,Daytrip Tote,Zepto (simulated),5,Good quality for everyday use and the finish looks premium.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0170,2026-10-13,Daytrip Tote,Blinkit (simulated),4,Looks great and has been working well so far.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0171,2026-10-18,Daytrip Tote,Flipkart (simulated),4,Delivery was smooth and the product matched the description.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0172,2026-10-19,Daytrip Tote,Flipkart (simulated),5,Good quality for everyday use and the finish looks premium.,,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0173,2026-10-17,Daytrip Tote,Amazon India (simulated),5,"Solid build, thoughtful pockets and good value for my needs.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0174,2026-10-10,Daytrip Tote,Amazon India (simulated),3,"The size is acceptable, though the product photos could explain dimensions better.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0175,2026-10-09,Daytrip Tote,Flipkart (simulated),3,"The size is acceptable, though the product photos could explain dimensions better.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0176,2026-10-15,Daytrip Tote,Blinkit (simulated),3,"Product is okay overall, but I expected a little more at this price.",,SYNTHETIC DEMO DATA — not collected from real customers
SYN-0177,2026-10-14,Daytrip Tote,Zepto (simulated),3,"The size is acceptable, though the product photos could explain dimensions better.",,SYNTHETIC DEMO DATA — not collected from real customers
`;

export function parseSampleCsv(csvText: string): Array<Record<string, string>> {
  return parseCsv(csvText);
}
