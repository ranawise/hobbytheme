@extends('layouts.admin')
<?php 
    // Define extension information.
    $EXTENSION_ID = "dailybackup";
    $EXTENSION_NAME = stripslashes("Daily Backup");
    $EXTENSION_VERSION = "1.0.0";
    $EXTENSION_DESCRIPTION = stripslashes("Automatic daily backups with one rotating daily slot plus a free manual backup.");
    $EXTENSION_ICON = "/assets/extensions/dailybackup/icon.jpg";
    $EXTENSION_WEBSITE = "[website]";
    $EXTENSION_WEBICON = "[webicon]";
?>
@include('blueprint.admin.template')

@section('title')
    {{ $EXTENSION_NAME }}
@endsection

@section('content-header')
    @yield('extension.header')
@endsection

@section('content')
    @yield('extension.config')
    @yield('extension.description')        .dailybackup-node-panel {
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            background: #12141c;
            max-height: 420px;
            overflow-y: auto;
        }
        .dailybackup-node-toolbar {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
        }
        .dailybackup-node-toolbar .form-control {
            max-width: 280px;
            background: #1a1d27;
            border-color: rgba(255, 255, 255, 0.12);
            color: #e5e7eb;
        }
        .dailybackup-node-toolbar .form-control::placeholder {
            color: #6b7280;
        }
        .dailybackup-node-toolbar .btn-default {
            background: #1a1d27;
            border-color: rgba(255, 255, 255, 0.12);
            color: #e5e7eb;
        }
        .dailybackup-node-toolbar .btn-default:hover {
            background: #252936;
            border-color: rgba(255, 255, 255, 0.2);
            color: #fff;
        }
        .dailybackup-location-group {
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding: 12px 14px;
        }
        .dailybackup-location-group:last-child {
            border-bottom: none;
        }
        .dailybackup-location-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .dailybackup-location-title {
            font-weight: 600;
            font-size: 13px;
            color: #d1d5db;
            margin: 0;
        }
        .dailybackup-location-header .btn-default {
            background: #1a1d27;
            border-color: rgba(255, 255, 255, 0.12);
            color: #cbd5e1;
        }
        .dailybackup-node-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 8px;
        }
        .dailybackup-node-card {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin: 0;
            padding: 10px 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            background: #1a1d27;
            cursor: pointer;
            transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
        }
        .dailybackup-node-card:hover {
            border-color: #3c8dbc;
            background: #222633;
        }
        .dailybackup-node-card.is-selected {
            border-color: #3c8dbc;
            background: rgba(60, 141, 188, 0.18);
            box-shadow: 0 0 0 1px rgba(60, 141, 188, 0.35);
        }
        .dailybackup-node-card input[type="checkbox"] {
            position: static !important;
            margin: 3px 0 0 !important;
            float: none !important;
            flex-shrink: 0;
            accent-color: #3c8dbc;
        }
        .dailybackup-node-card-body {
            flex: 1;
            min-width: 0;
        }
        .dailybackup-node-name {
            display: block;
            font-weight: 600;
            color: #f3f4f6;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .dailybackup-node-meta {
            display: block;
            font-size: 12px;
            color: #9ca3af;
            margin-top: 2px;
        }
        .dailybackup-selected-summary {
            margin-top: 14px;
            padding-top: 12px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .dailybackup-selected-summary strong {
            color: #e5e7eb;
        }
        .dailybackup-selected-summary .label {
            display: inline-block;
            margin: 0 6px 6px 0;
            font-size: 12px;
            font-weight: normal;
            padding: 5px 8px;
            background: #2a3142 !important;
            color: #e5e7eb !important;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .dailybackup-selected-summary .text-muted,
        #dailybackup-none-selected {
            color: #9ca3af !important;
        }
        .dailybackup-empty-search {
            padding: 24px;
            text-align: center;
            color: #9ca3af;
            display: none;
        }
        .dailybackup-node-card.is-hidden,
        .dailybackup-location-group.is-hidden {
            display: none !important;
        }
        #dailybackup-form .help-block {
            color: #9ca3af;
        }
        .dailybackup-enable-label {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 0;
            padding: 12px 14px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            background: #1a1d27;
            cursor: pointer;
            font-weight: 600;
            color: #e5e7eb;
            width: 100%;
            box-sizing: border-box;
        }
        .dailybackup-enable-label input[type="checkbox"] {
            position: static !important;
            margin: 0 !important;
            float: none !important;
            flex-shrink: 0;
            width: 16px;
            height: 16px;
            accent-color: #3c8dbc;
        }
        .dailybackup-enable-label span {
            line-height: 1.4;
        }
        #dailybackup-form #free_backup_limit {
            background: #1a1d27;
            border-color: rgba(255, 255, 255, 0.12);
            color: #f3f4f6;
        }
    </style>

    <div class="row">
        <div class="col-xs-12">
            <div class="callout callout-info">
                <h4>Daily backup policy</h4>
                <p>
                    Each eligible server gets <strong>{{ $free_backup_limit }} backup slots</strong>:
                    one automatic <strong>daily</strong> backup (rotated every day, locked) and
                    <strong>{{ $free_backup_limit - 1 }}</strong> slot(s) for manual backups.
                </p>
                <p class="text-muted" style="margin-bottom: 0;">
                    Only <code>[Daily]</code> backups are replaced on the next run. Manual backups are kept.
                    Checked every 15 minutes via <code>schedule:run</code> (one backup per server per day).
                </p>
            </div>
        </div>
    </div>

    <form method="post" action="{{ $root }}" id="dailybackup-form">
        @csrf
        @method('PATCH')

        <div class="row">
            <div class="col-lg-8">
                <div class="box box-primary">
                    <div class="box-header with-border clearfix">
                        <h3 class="box-title"><i class="fa fa-server"></i> Nodes with daily backups</h3>
                        <div class="box-tools pull-right">
                            <span class="label label-primary" id="dailybackup-selected-count">{{ count($node_ids) }} selected</span>
                        </div>
                    </div>
                    <div class="box-body">
                        <p class="text-muted">
                            Click nodes to toggle them. All servers on selected nodes receive automatic daily backups when enabled below.
                        </p>

                        <div class="dailybackup-node-toolbar">
                            <input
                                type="search"
                                id="dailybackup-node-search"
                                class="form-control"
                                placeholder="Search by node name, FQDN, or location..."
                                autocomplete="off"
                            >
                            <button type="button" class="btn btn-sm btn-default" id="dailybackup-select-all">
                                <i class="fa fa-check-square-o"></i> Select all
                            </button>
                            <button type="button" class="btn btn-sm btn-default" id="dailybackup-select-none">
                                <i class="fa fa-square-o"></i> Clear all
                            </button>
                        </div>

                        @if ($nodes->isEmpty())
                            <p class="text-muted text-center" style="padding: 24px 0;">No nodes found on this panel.</p>
                        @else
                            <div class="dailybackup-node-panel" id="dailybackup-node-panel">
                                @php
                                    $grouped = $nodes->groupBy(fn ($node) => $node->location_id ?? 0);
                                @endphp
                                @foreach ($grouped as $locationId => $locationNodes)
                                    @php
                                        $location = $locationNodes->first()->location;
                                        $locationLabel = $location
                                            ? ($location->short . ($location->long ? ' — ' . $location->long : ''))
                                            : 'Unassigned location';
                                    @endphp
                                    <div
                                        class="dailybackup-location-group"
                                        data-location-label="{{ strtolower($locationLabel) }}"
                                    >
                                        <div class="dailybackup-location-header">
                                            <p class="dailybackup-location-title">
                                                <i class="fa fa-map-marker text-muted"></i> {{ $locationLabel }}
                                            </p>
                                            <button
                                                type="button"
                                                class="btn btn-xs btn-default dailybackup-location-toggle"
                                                data-action="select"
                                            >Select group</button>
                                        </div>
                                        <div class="dailybackup-node-grid">
                                            @foreach ($locationNodes as $node)
                                                @php $isSelected = in_array($node->id, $node_ids, true); @endphp
                                                <label
                                                    class="dailybackup-node-card{{ $isSelected ? ' is-selected' : '' }}"
                                                    data-search="{{ strtolower($node->name . ' ' . $node->fqdn . ' ' . $locationLabel . ' ' . $node->id) }}"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        name="node_ids[]"
                                                        value="{{ $node->id }}"
                                                        @if($isSelected) checked @endif
                                                    >
                                                    <span class="dailybackup-node-card-body">
                                                        <span class="dailybackup-node-name">{{ $node->name }}</span>
                                                        <span class="dailybackup-node-meta">
                                                            #{{ $node->id }} · {{ $node->fqdn }} · {{ $node->servers_count }} {{ $node->servers_count === 1 ? 'server' : 'servers' }}
                                                        </span>
                                                    </span>
                                                </label>
                                            @endforeach
                                        </div>
                                    </div>
                                @endforeach
                                <div class="dailybackup-empty-search" id="dailybackup-empty-search">
                                    <i class="fa fa-search"></i> No nodes match your search.
                                </div>
                            </div>

                            <div class="dailybackup-selected-summary">
                                <strong>Selected nodes</strong>
                                <div id="dailybackup-selected-tags" style="margin-top: 8px;">
                                    @forelse ($selected_nodes as $node)
                                        <span class="label label-default" data-node-id="{{ $node->id }}">#{{ $node->id }} {{ $node->name }}</span>
                                    @empty
                                        <span class="text-muted" id="dailybackup-none-selected">None selected — daily backups will not run until you pick at least one node.</span>
                                    @endforelse
                                </div>
                            </div>
                        @endif
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="box box-primary">
                    <div class="box-header with-border">
                        <h3 class="box-title"><i class="fa fa-cog"></i> Settings</h3>
                    </div>
                    <div class="box-body">
                        <div class="form-group" style="margin-bottom: 16px;">
                            <input type="hidden" name="enabled" value="0">
                            <label class="dailybackup-enable-label">
                                <input type="checkbox" name="enabled" value="1" @if($enabled) checked @endif>
                                <span>Enable automatic daily backups</span>
                            </label>
                            <p class="help-block" style="margin-top: 8px; margin-bottom: 0;">When off, the scheduled job skips all servers even if nodes are selected.</p>
                        </div>

                        <div class="form-group">
                            <label for="free_backup_limit" class="control-label">Backup slots per server</label>
                            <input
                                type="number"
                                name="free_backup_limit"
                                id="free_backup_limit"
                                class="form-control input-lg"
                                min="2"
                                max="10"
                                value="{{ $free_backup_limit }}"
                            >
                            <p class="help-block">
                                <strong>2</strong> = 1 locked daily backup + 1 manual slot.
                                Saving bumps servers on selected nodes up to this limit if they were lower.
                            </p>
                        </div>

                        <div class="callout callout-warning" style="margin-bottom: 0; padding: 10px 12px;">
                            <p style="margin: 0; font-size: 13px;">
                                <i class="fa fa-clock-o"></i> Panel cron runs <code>schedule:run</code> every minute; this extension checks every 15 minutes and creates one backup per server per day.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-xs-12">
                <button type="submit" class="btn btn-primary btn-lg">
                    <i class="fa fa-save"></i> Save configuration
                </button>
            </div>
        </div>
    </form>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            var panel = document.getElementById('dailybackup-node-panel');
            if (!panel) {
                return;
            }

            var search = document.getElementById('dailybackup-node-search');
            var countEl = document.getElementById('dailybackup-selected-count');
            var tagsEl = document.getElementById('dailybackup-selected-tags');
            var emptyEl = document.getElementById('dailybackup-empty-search');
            var noneHtml = '<span class="text-muted" id="dailybackup-none-selected">None selected — daily backups will not run until you pick at least one node.</span>';

            function escapeHtml(text) {
                var el = document.createElement('div');
                el.textContent = text;
                return el.innerHTML;
            }

            function nodeCheckboxes() {
                return panel.querySelectorAll('.dailybackup-node-card input[type="checkbox"]');
            }

            function updateSelectedState() {
                var checked = panel.querySelectorAll('.dailybackup-node-card input[type="checkbox"]:checked');

                if (countEl) {
                    countEl.textContent = checked.length + ' selected';
                }

                panel.querySelectorAll('.dailybackup-node-card').forEach(function (card) {
                    var cb = card.querySelector('input[type="checkbox"]');
                    card.classList.toggle('is-selected', !!(cb && cb.checked));
                });

                var tags = [];
                checked.forEach(function (cb) {
                    var card = cb.closest('.dailybackup-node-card');
                    var name = card ? (card.querySelector('.dailybackup-node-name') || {}).textContent || '' : '';
                    tags.push('<span class="label label-default">#' + cb.value + ' ' + escapeHtml(name) + '</span>');
                });

                if (tagsEl) {
                    tagsEl.innerHTML = tags.length ? tags.join('') : noneHtml;
                }
            }

            function filterNodes(query) {
                query = (query || '').toLowerCase().trim();
                var visibleCards = 0;

                panel.querySelectorAll('.dailybackup-location-group').forEach(function (group) {
                    var groupLabel = group.getAttribute('data-location-label') || '';
                    var groupVisible = 0;

                    group.querySelectorAll('.dailybackup-node-card').forEach(function (card) {
                        var haystack = card.getAttribute('data-search') || '';
                        var match = !query || haystack.indexOf(query) !== -1 || groupLabel.indexOf(query) !== -1;
                        card.classList.toggle('is-hidden', !match);
                        if (match) {
                            groupVisible++;
                            visibleCards++;
                        }
                    });

                    group.classList.toggle('is-hidden', groupVisible === 0);
                });

                if (emptyEl) {
                    emptyEl.style.display = visibleCards === 0 && query.length > 0 ? 'block' : 'none';
                }
            }

            panel.addEventListener('change', function (e) {
                if (e.target && e.target.matches('input[type="checkbox"]')) {
                    updateSelectedState();
                }
            });

            if (search) {
                search.addEventListener('input', function () {
                    filterNodes(search.value);
                });
            }

            var selectAll = document.getElementById('dailybackup-select-all');
            if (selectAll) {
                selectAll.addEventListener('click', function (e) {
                    e.preventDefault();
                    panel.querySelectorAll('.dailybackup-node-card:not(.is-hidden) input[type="checkbox"]').forEach(function (cb) {
                        cb.checked = true;
                    });
                    updateSelectedState();
                });
            }

            var selectNone = document.getElementById('dailybackup-select-none');
            if (selectNone) {
                selectNone.addEventListener('click', function (e) {
                    e.preventDefault();
                    nodeCheckboxes().forEach(function (cb) {
                        cb.checked = false;
                    });
                    updateSelectedState();
                });
            }

            panel.querySelectorAll('.dailybackup-location-toggle').forEach(function (btn) {
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    var group = btn.closest('.dailybackup-location-group');
                    if (!group) {
                        return;
                    }
                    group.querySelectorAll('.dailybackup-node-card:not(.is-hidden) input[type="checkbox"]').forEach(function (cb) {
                        cb.checked = true;
                    });
                    updateSelectedState();
                });
            });

            updateSelectedState();
        });
    </script>
@endsection
