SET FOREIGN_KEY_CHECKS = 0;

-- Delete data from all tables except User
-- Note: Order is not strictly necessary with FOREIGN_KEY_CHECKS = 0, 
-- but it's cleaner to go from dependent to parent.

TRUNCATE TABLE `Ticket`;
TRUNCATE TABLE `Seat`;
TRUNCATE TABLE `TicketType`;
TRUNCATE TABLE `EventDeletionRequest`;
TRUNCATE TABLE `RefundRequest`;
TRUNCATE TABLE `Payment`;
TRUNCATE TABLE `Order`;
TRUNCATE TABLE `Discount`;
TRUNCATE TABLE `Banner`;
TRUNCATE TABLE `Event`;
TRUNCATE TABLE `EventCategory`;
TRUNCATE TABLE `Venue`;
TRUNCATE TABLE `OrganizerInfo`;
TRUNCATE TABLE `Role`;

-- If you want to delete specific users but keep admin, you can use:
-- DELETE FROM `User` WHERE role_id != 2; -- assuming 2 is admin

SET FOREIGN_KEY_CHECKS = 1;
