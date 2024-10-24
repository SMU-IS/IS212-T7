import EmployeeService from "@/services/EmployeeService";
import Mailer from "@/config/mailer";

interface ManagerDetails {
  name: string;
  email: string;
}

class NotificationService {
  private employeeService: EmployeeService;
  private mailer: Mailer;

  constructor(
    employeeService: EmployeeService,
    mailer: Mailer
  ) {
    this.employeeService = employeeService;
    this.mailer = mailer;
  }

  private async getManagerDetails(managerId: number, tempManagerId: number | null): Promise<ManagerDetails> {
    const id = tempManagerId ?? managerId;
    const managerDetails = await this.employeeService.getEmployee(id);
    if (!managerDetails) throw new Error("Manager details not found");

    return {
      name: `${managerDetails.staffFName} ${managerDetails.staffLName}`,
      email: managerDetails.email
    };
  }

  private createEmailContent(manager: ManagerDetails, requestDates: [string, string][], requestReason: string): { text: string; html: string } {
    if (requestDates.length === 0) {
      throw new Error("No dates to send");
    }

    const textBody = this.createTextBody(manager, requestDates, requestReason);
    const htmlBody = this.createHtmlBody(manager, requestDates, requestReason);

    return { text: textBody, html: htmlBody };
  }

  private createTextBody(manager: ManagerDetails, requestDates: [string, string][], requestReason: string): string {
    let textBody = `Your WFH request for the following dates have been sent to ${manager.name}(${manager.email}):\n`;
    requestDates.forEach(([date, type]) => {
      textBody += `${date}, ${type}\n`;
    });
    textBody += `\nReason: ${requestReason}\n`;
    return textBody;
  }

  private createHtmlBody(manager: ManagerDetails, requestDates: [string, string][], requestReason: string): string {
    const tableRows = requestDates.map(([date, type], index) => `
    <tr>
      <td style="border: 1px solid black; border-collapse: collapse;">${date}</td>
      <td style="border: 1px solid black; border-collapse: collapse;">${type}</td>
      ${index === 0 ? `<td style="border: 1px solid black; border-collapse: collapse;" rowspan="${requestDates.length}">${requestReason}</td>` : ''}
    </tr>
  `).join('');

    return `
    <html>
      <head></head>
      <body>
        <p>Your WFH request for the following dates have been sent to ${manager.name} (<a href="mailto:${manager.email}">${manager.email}</a>).</p>
        <table style="border: 1px solid black; border-collapse: collapse;">
          <tr>
            <th style="border: 1px solid black; border-collapse: collapse;">Requested Dates</th>
            <th style="border: 1px solid black; border-collapse: collapse;">Duration</th>
            <th style="border: 1px solid black; border-collapse: collapse;">Reason</th>
          </tr>
          ${tableRows}
        </table>
      </body>
    </html>
  `;
  }

  private async sendEmail(staffEmail: string, content: { text: string; html: string }): Promise<void> {
    const transporter = this.mailer.getTransporter();
    const staffName = staffEmail.split("@")[0];

    const mailOptions = {
      from: 'noreply@lurence.org',
      to: `${staffName}@yopmail.com`,
      subject: 'WFH Request Sent',
      text: content.text,
      html: content.html
    };

    await transporter.sendMail(mailOptions);
  }

  public async pushRequestSentNotification(
    staffEmail: string,
    managerId: number,
    tempManagerId: number | null,
    requestDates: [string, string][],
    requestReason: string
  ): Promise<string> {
    try {
      const managerDetails = await this.getManagerDetails(managerId, tempManagerId);
      const emailContent = this.createEmailContent(managerDetails, requestDates, requestReason);
      await this.sendEmail(staffEmail, emailContent);
      return "Email sent successfully!";
    } catch (error) {
      // console.error('Error sending email:', error);
      return "Failed to send email";
    }
  }
}

export default NotificationService;