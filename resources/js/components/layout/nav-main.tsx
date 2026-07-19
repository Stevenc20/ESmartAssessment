import { memo } from 'react';
import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export const NavMain = memo(function NavMain({
    items = [],
    label = 'Platform',
}: {
    items: NavItem[];
    label?: string;
}) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-0 py-1">
            <SidebarGroupLabel
                className="mb-1 px-3 group-data-[collapsible=icon]:hidden"
                style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'rgba(67,99,145,0.5)',
                    lineHeight: '1.5',
                }}
            >
                {label}
            </SidebarGroupLabel>

            <SidebarMenu className="gap-0.5">
                {items.map((item) => {
                    const active = isCurrentUrl(item.href, undefined, true);

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={{ children: item.title }}
                                className="relative h-10 w-full rounded-xl px-3 transition-all duration-150 data-[active=true]:bg-transparent hover:bg-transparent"
                                style={active ? {
                                    background: 'linear-gradient(135deg, #436391 0%, #5a7aaa 100%)',
                                    boxShadow: '0 2px 10px rgba(67,99,145,0.22)',
                                } : undefined}
                            >
                                <Link href={item.href} className="flex w-full items-center gap-3">
                                    {active && (
                                        <span
                                            aria-hidden="true"
                                            style={{
                                                position: 'absolute',
                                                left: '-8px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                width: '3px',
                                                height: '20px',
                                                borderRadius: '0 4px 4px 0',
                                                background: '#F2AEBC',
                                            }}
                                        />
                                    )}
                                    {item.icon && (
                                        <item.icon
                                            style={{
                                                width: '16px',
                                                height: '16px',
                                                flexShrink: 0,
                                                color: active ? 'rgba(255,255,255,0.9)' : '#6b7a99',
                                            }}
                                        />
                                    )}
                                    <span
                                        style={{
                                            fontSize: '14px',
                                            fontWeight: active ? 600 : 500,
                                            color: active ? '#ffffff' : '#2d3748',
                                            letterSpacing: '0.01em',
                                        }}
                                    >
                                        {item.title}
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
});
