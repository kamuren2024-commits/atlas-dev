import dns from 'dns/promises';
import net from 'net';
import { McpInvocation, McpPolicyGuard, McpToolDescriptor } from './contracts';

export interface CredentialReference {
  provider: string;
  secretName: string;
}

export interface CredentialProvider {
  resolve(reference: CredentialReference): Promise<{ token: string }>;
}

export class DestinationAllowlist {
  constructor(private readonly allowedHosts: Set<string>) {}

  public async validate(urlValue: string): Promise<URL> {
    let url: URL;
    try {
      url = new URL(urlValue);
    } catch {
      throw new Error('MCP_DESTINATION_INVALID');
    }
    if (!['https:'].includes(url.protocol)) throw new Error('MCP_PROTOCOL_BLOCKED');
    if (url.username || url.password) throw new Error('MCP_CREDENTIALS_IN_URL_BLOCKED');
    if (!this.allowedHosts.has(url.hostname.toLowerCase())) throw new Error('MCP_DESTINATION_NOT_ALLOWLISTED');
    const addresses = await dns.lookup(url.hostname, { all: true });
    if (addresses.some(address => this.isPrivateAddress(address.address))) {
      throw new Error('MCP_PRIVATE_DESTINATION_BLOCKED');
    }
    return url;
  }

  private isPrivateAddress(address: string): boolean {
    if (net.isIPv4(address)) {
      const parts = address.split('.').map(Number);
      return parts[0] === 10 || parts[0] === 127 || parts[0] === 0 ||
        (parts[0] === 169 && parts[1] === 254) ||
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 192 && parts[1] === 168);
    }
    return address === '::1' || address.toLowerCase().startsWith('fe80:') ||
      address.toLowerCase().startsWith('fc') || address.toLowerCase().startsWith('fd');
  }
}

export class McpGateway {
  constructor(
    private readonly policy: McpPolicyGuard,
    private readonly allowlist: DestinationAllowlist
  ) {}

  public async authorize(invocation: McpInvocation): Promise<'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL' | 'ESCALATE'> {
    if (!this.isDescriptorComplete(invocation.tool)) throw new Error('MCP_TOOL_SECURITY_DECLARATION_INCOMPLETE');
    return this.policy.authorize(invocation);
  }

  public async validateDestination(tool: McpToolDescriptor, destination: string): Promise<URL> {
    let parsedDestination: URL;
    try {
      parsedDestination = new URL(destination);
    } catch {
      throw new Error('MCP_DESTINATION_INVALID');
    }
    if (!tool.allowedDestinations.includes(parsedDestination.hostname.toLowerCase())) {
      throw new Error('MCP_TOOL_DESTINATION_BLOCKED');
    }
    return this.allowlist.validate(parsedDestination.toString());
  }

  private isDescriptorComplete(tool: McpToolDescriptor): boolean {
    return Boolean(
      tool.toolId && tool.provider && tool.version && tool.inputSchema && tool.outputSchema &&
      tool.requiredScopes && tool.allowedRoles && tool.allowedTenants &&
      tool.allowedDestinations &&
      tool.rateLimit && tool.timeoutMs > 0 && tool.riskLevel && tool.humanApprovalRequirement
    );
  }
}
